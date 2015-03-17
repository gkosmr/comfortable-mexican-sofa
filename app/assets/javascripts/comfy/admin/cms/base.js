window.CMS || (window.CMS = {});

window.CMS.code_mirror_instances = [];

$(document).on('page:load ready', function() {
  window.CMS.current_path = window.location.pathname;
  return CMS.init();
});

window.CMS.init = function() {
  CMS.set_iframe_layout();
  CMS.slugify();
  CMS.wysiwyg();
  CMS.codemirror();
  CMS.sortable_list();
  CMS.timepicker();
  CMS.page_blocks();
  CMS.page_file_popovers();
  CMS.mirrors();
  CMS.page_update_preview();
  CMS.page_update_publish();
  CMS.categories();
  CMS.chosen();
  return CMS.files();
};

window.CMS.slugify = function() {
  var slugify;
  slugify = function(str) {
    var chars_to_remove, chars_to_replace_with_delimiter, from, i, j, ref, to;
    str = str.replace(/^\s+|\s+$/g, '');
    from = "ÀÁÄÂÃÈÉËÊÌÍÏÎÒÓÖÔÕÙÚÜÛàáäâãèéëêìíïîòóöôõùúüûÑñÇç";
    to = "aaaaaeeeeiiiiooooouuuuaaaaaeeeeiiiiooooouuuunncc";
    for (i = j = 0, ref = from.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      str = str.replace(new RegExp(from[i], "g"), to[i]);
    }
    chars_to_replace_with_delimiter = new RegExp('[·/,:;_]', 'g');
    str = str.replace(chars_to_replace_with_delimiter, '-');
    chars_to_remove = new RegExp('[^a-zA-Z0-9 -]', 'g');
    return str = str.replace(chars_to_remove, '').replace(/\s+/g, '-').toLowerCase();
  };
  return $('input[data-slugify=true]').bind('keyup.cms', function() {
    return $('input[data-slug=true]').val(slugify($(this).val()));
  });
};

window.CMS.wysiwyg = function() {
  var csrf_param, csrf_token, params;
  csrf_token = $('meta[name=csrf-token]').attr('content');
  csrf_param = $('meta[name=csrf-param]').attr('content');
  if (csrf_param !== void 0 && csrf_token !== void 0) {
    params = csrf_param + "=" + encodeURIComponent(csrf_token);
  }
  return $('textarea.rich-text-editor, textarea[data-cms-rich-text]').redactor({
    minHeight: 160,
    autoresize: true,
    imageUpload: CMS.file_upload_path + "?source=redactor&type=image&" + params,
    imageManagerJson: CMS.file_upload_path + "?source=redactor&type=image",
    fileUpload: CMS.file_upload_path + "?source=redactor&type=file&" + params,
    fileManagerJson: CMS.file_upload_path + "?source=redactor&type=file",
    buttonSource: true,
    formatting: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5'],
    formattingAdd: [{
        tag: 'h4',
        title: 'Header 4 Sub',
        class: 'subheader'
      }, {
        tag: 'span',
        title: 'Primary Button',
        class: 'button'
      }, {
        tag: 'span',
        title: 'Secondary Button',
        class: 'button secondary'
      }
    ],
    plugins: ['imagemanager', 'filemanager', 'table', 'video', 'definedlinks'],
    lang: CMS.locale,
    definedLinks: CMS.pages_path + "?source=redactor"
  });
};

window.CMS.codemirror = function() {
  $('textarea[data-cms-cm-mode]').each(function(i, element) {
    var cm;
    cm = CodeMirror.fromTextArea(element, {
      mode: $(element).data('cms-cm-mode'),
      lineWrapping: true,
      autoCloseTags: true,
      lineNumbers: true
    });
    CMS.code_mirror_instances.push(cm);
    return $(cm.display.wrapper).resizable({
      resize: function() {
        cm.setSize($(this).width(), $(this).height());
        return cm.refresh();
      }
    });
  });
  return $('a[data-toggle="tab"]').on('shown', function() {
    var cm, j, len, ref, results;
    ref = CMS.code_mirror_instances;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      cm = ref[j];
      results.push(cm.refresh());
    }
    return results;
  });
};

window.CMS.sortable_list = function() {
  return $('.sortable').sortable({
    handle: 'div.dragger',
    axis: 'y',
    update: function() {
      return $.post(CMS.current_path + "/reorder", "_method=put&" + ($(this).sortable('serialize')));
    }
  });
};

window.CMS.timepicker = function() {
  $('input[type=text][data-cms-datetime]').datetimepicker({
    format: 'yyyy-mm-dd hh:ii',
    minView: 0,
    autoclose: true
  });
  return $('input[type=text][data-cms-date]').datetimepicker({
    format: 'yyyy-mm-dd',
    minView: 2,
    autoclose: true
  });
};

window.CMS.page_blocks = function() {
  return $('select#page_layout_id').bind('change.cms', function() {
    return $.ajax({
      url: $(this).data('url'),
      data: {
        layout_id: $(this).val()
      },
      complete: function() {
        CMS.wysiwyg();
        CMS.timepicker();
        CMS.codemirror();
        CMS.chosen();
        return CMS.page_file_popovers();
      }
    });
  });
};

window.CMS.page_file_popovers = function() {
  return $('[data-toggle="page-file-popover"]').popover({
    trigger: 'hover',
    placement: 'top',
    html: true
  });
};

window.CMS.mirrors = function() {
  return $('#mirrors select').change(function() {
    return window.location = $(this).val();
  });
};

window.CMS.page_update_preview = function() {
  $('input[name=commit]').click(function() {
    return $(this).parents('form').attr('target', '');
  });
  return $('input[name=preview]').click(function() {
    return $(this).parents('form').attr('target', '_blank');
  });
};

window.CMS.page_update_publish = function() {
  var widget;
  widget = $('#form-save');
  $('input', widget).prop('checked', $('input#page_is_published').is(':checked'));
  $('button', widget).html($('input[name=commit]').val());
  $('input', widget).click(function() {
    return $('input#page_is_published').prop('checked', $(this).is(':checked'));
  });
  $('input#page_is_published').click(function() {
    return $('input', widget).prop('checked', $(this).is(':checked'));
  });
  return $('button', widget).click(function() {
    return $('input[name=commit]').click();
  });
};

window.CMS.categories = function() {
  return $('a', '.categories-widget .action-links').click(function(event) {
    event.preventDefault();
    $('.categories.read', '.categories-widget').toggle();
    $('.categories.editable', '.categories-widget').toggle();
    $('.edit', '.categories-widget').toggle();
    return $('.done', '.categories-widget').toggle();
  });
};

window.CMS.set_iframe_layout = function() {
  var in_iframe;
  in_iframe = function() {
    var e;
    try {
      return window.self !== window.top;
    } catch (_error) {
      e = _error;
      return true;
    }
  };
  return $('body').ready(function() {
    if (in_iframe()) {
      return $('body').addClass('in-iframe');
    }
  });
};

window.CMS.chosen = function() {
  return $('select[data-chosen]').chosen();
};