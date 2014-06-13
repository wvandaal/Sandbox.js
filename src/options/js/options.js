$(function() {
  var $aliasTbl   = $('#aliases'),
      $body       = $('body'),
      $save       = $('#save'),
      $aliasForm  = $('#aliasForm'),
      $valid      = $('#valid'),
      menu        = new Menu('#options-menu'),   
      $tracking   = $('#rum'),    
      aliases;

  function renderAliases( obj ) {
    aliases = $.extend(true, (aliases || {}), obj);
    $aliasTbl.find('tbody').html(Templates.aliasTable({aliases: aliases}));
  }

  function validateAlias( alias ) {
    var valid   = /^[\w\.]+\s*(?:@(?:\d+\.?){1,3})?\s*\:?\s*(?:\[(?:[\w\.\/](?:,\s*)?)+\])?$/,
        queries = alias.split(/\s*&\s*/);

    return !queries.some(function(a) {return !valid.test(a) && !aliases[a];});
  }

  // get the initial list of aliases
  chrome.storage.sync.get('settings', function(resp) {
    renderAliases(resp.settings.aliases);
    $tracking.prop('checked', resp.settings.tracking);
  });

  // add contenteditable to the appropriate .query element when the user 
  // dblclicks
  $aliasTbl.on('dblclick', '.query', function(e) {
    $(this).prop('contenteditable', true).focus();
  });


  $aliasTbl.on('keypress', '.query', function(e) {
    var $target = $(this);

    if (e.which === 13) {
      e.preventDefault();
      $target.removeAttr('contenteditable');
      if (!$target.html())
        $target.html(aliases[$(this).parent().find('.alias').html()]);
    }
  });

  $aliasTbl.on('keyup', '.query', function() {
    var $target = $(this);

    if (validateAlias(this.innerHTML)) {
      $target.removeClass('invalid');
    } else {
      $target.addClass('invalid');
    }
  });

  // remove contenteditable when the user clicks anywhere else in the body
  $body.on('blur', '[contenteditable="true"]', function() {
    var $queries = $('.query'); 

    $queries.each(function() {
      $(this).removeAttr('contenteditable');
      if (!this.innerHTML)
        this.innerHTML = aliases[$(this).parent().find('.alias').html()];
    });
  });

  // save the changes to the user's aliases
  $save.on('click', function() {
    var aliasHash = {},
        $button   = $(this),
        allValid  = true,
        tracking  = $tracking.is(':checked');

    $button.html('Saving...');

    // collect all of the aliases in the table, validate them,
    // and map them to the aliases object
    $aliasTbl.find('tbody').children().each(function() {
      var $this     = $(this),
          alias     = $this.find('.alias').text(),
          query     = $this.find('.query').text();

      if (query) {
        // validate each query string
        if (validateAlias(query)) {
          $this.removeClass('invalid');
          aliasHash[alias] = query;
        } else {
          allValid = false;
          $this.addClass('invalid');
        }
      }
    });
    
    // if all queries are valid, save them to the sync storage
    if (allValid) {
      chrome.storage.sync.set({settings: {aliases: aliasHash, tracking: tracking}}, function() {
        aliases = aliasHash;
        $button.html('Save Settings');
      });
    } else {
      if (menu.selected !== '#aliasing')
        menu.selectFirst();

      $button.html('Save Settings');
    }
  });

  // remove the table row if the delete button is clicked
  $aliasTbl.on('click', '.delete', function() {
    var $this = $(this),
        $row  = $this.parent(),
        alias = $row.find('.alias').html();

    delete aliases[alias];
    $row.remove();
  });


  $aliasForm.on('keyup', '#newQuery', function() {
    if (validateAlias(this.value)) {
      $valid.removeClass('icon-cancel-circle');
      $valid.addClass('icon-ok-circle');
    } else if (!this.value){
      $valid.removeAttr('class');
    } else {
      $valid.addClass('icon-cancel-circle');
      $valid.removeClass('icon-ok-circle');
    }
  });

  $aliasForm.on('submit', function(e) {
    var $form    = $(this),
        alias    = $form.find('#newAlias').val(),
        query    = $form.find('#newQuery').val(),
        newAlias = {};

    e.preventDefault();

    newAlias[alias] = query;

    renderAliases(newAlias);

    $valid.removeAttr('class');

    this.reset();
  });
});


function Menu(sel) {
  var that = this;
  this.$el = $(sel);
  this.$menuItems = this.$el.find('li');
  this.items = {};

  this.selectFirst();

  this.$el.on('click', 'li', function() {
    that.select(this);
  });
}

Menu.prototype.select = function($item) {
  var that = this;

  $item = $item instanceof jQuery ? $item : $($item);

  this.$menuItems.each(function() {
    var $this   = $(this),
        target  = $this.data('target');

    if (!that.items[target])
      that.items[target] = $('#' + target);


    if ($this.is($item)) {
      $this.addClass('selected');
      that.items[target].show();
      that.selected = '#' + target;
    } else {
      $this.removeClass('selected');
      that.items[target].removeAttr('style');
    }
  });
};

Menu.prototype.selectFirst = function() {
  this.select(this.$menuItems[0]);
};