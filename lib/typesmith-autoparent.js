
var merge_options = require('merge-options');

module.exports = plugin;

function plugin(opts) {

  var plugin_defaults = {
    scope_separator:'.',
    child_types:'*'
  }

  return function(typesmith, done){

    var config = merge_options.call({concatArrays: true}, {}, plugin_defaults, typesmith.config['typesmith-autoparent'], opts);

    Object.keys(typesmith.db).forEach( function(uid) {
      var record = typesmith.db[uid];
      var record_type = record.type;
      var type_config = typesmith.config.types[record_type] || {};
      var final_config = merge_options.call({concatArrays: true}, {}, config, type_config, record);

      var last_separator = record.name.lastIndexOf(final_config.scope_separator);
      if (last_separator == -1) return;

      // split on last index of scope separator to get the parent
      var scope = record.name.substr(0, last_separator);
      var possible_parents = typesmith.lookup_by_name(scope);

      // get all possible parents from the db, and check to make sure its type is allowed
      // to have children of this record's type
      var parent_record, parent_final_config;
      for (var i_parent = 0; i_parent < possible_parents.length; i_parent++)
      {
        var possible_parent = possible_parents[i_parent];
        var parent_type = possible_parent.type;
        var parent_type_config = typesmith.config.types[parent_type] || {};
        parent_final_config = merge_options.call({concatArrays: true}, {}, config, parent_type_config, possible_parent);
        if ( typeof(parent_final_config.child_types) === 'undefined' ||
             parent_final_config.child_types == '*' ||
             parent_final_config.child_types.includes(record.type))
        {
          // found a valid parent. Let's take it.
          parent_record = possible_parent;
          break;
        }
      }

      if (parent_record) {
        // add the record directly to the parent, assuming it's not already there.
        if (parent_record.children.indexOf(record.uid) == -1)
        {
          parent_record.children.push(record.uid);
        }
        record.parent = parent_record.uid;
      }

   });

    done();
  }
}