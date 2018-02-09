
module.exports = plugin;

/*
  This plugin goes through the typesmith database looking for parent-child relationships based on
  the names of the elements. The default scope separator is `.`, so if you have an element in the db with
  the name `myclass`, and another object with the name `myclass.myfunction`, the function element will get
  recorded automatically in the `children` array of the parent class element. So, if you're using mixtape,
  it'll show the docs for that function on the page it generates for the parent class.

  options:

  Note: You can configure these options globally for all record types by setting them in the plugin options. Or,
  you can tailor them individually for different record types by setting them in the typesmith config.types object. The
  specific setting overrides the general when it exists.

  - scope_separator:  The character or characters to use when determining the scope/parent of each element. You might
                      use a `.` for an API in Javascript or Python, or a `/` for file paths or folders, or
                      a `::` for a C++ API, or ` > ` if you are documenting menu paths, or whatever. Default is `.`.
  - child_types:      By default, the plugin will assume that all types can be parents and children of all other
                      types. If this isn't true for the items in your database, you can set up the typesmith type
                      configuration to indicate which types of children each type can have. Give each type
                      definition in the `types` array a `child_types` key, and set its value to the array of other
                      types that this type can have as children. This helps the plugin make sure that it chooses
                      only the right kind of parent elements for each record if there is a naming ambiguity.
                      Set to empty array or empty string to say "no children allowed". Set to '*' or leave unset to
                      say "all types allowed."

  example of a possible type configuration:
  {
    "types":{
      "class":{
        "child_types":["class","function","member","typedef"],  // records of type class can have these kinds of children.
      },
      "function":{
        "child_types":[].                     // records of type function can't have any children.
      },
      "namespace":{
                                             // leave out the child_types array entirely to allow any kind of child records.
      }
    }
  }
*/

function plugin(opts) {

  var plugin_defaults = {
    scope_separator:'.',
    child_types:'*'
  }

  return function(typesmith, done){
    opts = opts || typesmith.config['typesmith-autoparent'] || {}

    var defaults = Object.assign({}, plugin_defaults, opts);

    Object.keys(typesmith.db).forEach( function(uid) {
      var record = typesmith.db[uid];
      var record_type = record.type;
      var type_config = typesmith.config.types[record_type] || {};
      var final_config = Object.assign({}, defaults, type_config);

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
        parent_final_config = Object.assign({}, defaults, parent_type_config);
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