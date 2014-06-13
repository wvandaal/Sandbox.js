(function(window) {
  var Templates = {};

  Templates.aliasTable = function( obj ){
    var __t,
        __p   = '',
        __j   = Array.prototype.join,
        print = function(){ 
          __p += __j.call(arguments,'');
        };

    with ( obj || {} ){
      __p += '\n    ';

      if (Object.keys(aliases).length) { 

        __p+='\n      ';
        _.each(aliases, function(v,k) { 
          __p += '\n        <tr>\n         <td class=\'alias\'>'+
              ((__t = ( k )) == null ? '' : __t ) +
              '</td>\n         <td class=\'query\'>'+
              ((__t = ( v )) == null ? '' : __t) +
              '</td>\n         <td class=\'delete\'>Delete</td>\n        </tr>\n      ';
        }); 
        __p += '\n    ';
      } else { 
        __p += '\n      <tr>\n        <td id="placeholder" colspan="100%">\n          ' +
        ((__t = ( 'You don\'t have any aliases yet. Add aliases to access your favorite assets more quickly!' )) == null ? '' : __t) +
        '\n        </td>\n      </tr>\n    ';
      } 
      __p += '\n  ';
    }
    return __p;
  };

  window.Templates = Templates;
})(window);