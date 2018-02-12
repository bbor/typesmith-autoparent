# typesmith-autoparent

This plug-in for [typesmith](https://www.github.com/bbor/typesmith) automatically organizes the typesmith database into parent-child relationships based on the names of the records.

It examines each record in turn, looking for a scope separator. The default scope separator is `.`, but you can set a different one in the options. Whatever comes before the last scope separator is considered the scope of this record, and the plug-in looks for a matching parent element with that scope as its name. If it finds one, the record is added automatically as a child of that parent element.

So, say you have a `function` object named `myclass.myfunc`. The plugin will look for another record in the database with the name `myclass`. If found, then the function record will get put as a child of the `myclass` parent. If you're using mixtape, the child will then show up in the parent's content.

## Options

`scope_separator`

>	The character or characters to use when determining the scope/parent of each element. You might use a `.` for an API in Javascript or Python, or a `/` for file paths or folders, or a `::` for a C++ API, or ` > ` if you are documenting menu paths, or whatever. Default is `.`.

`child_types`

>	By default, the plugin will assume that all types can be parents and children of all other types. If this isn't true for the items in your database, you can set up the typesmith type configuration to indicate which types of children each type can have. Give each type definition in the `types` array a `child_types` key, and set its value to the array of other types that this type can have as children. This helps the plugin make sure that it chooses only the right kind of parent elements for each record if there is a naming ambiguity. Set to empty array or empty string to say "no children allowed". Set to `*` or leave unset to say "all types allowed."

## Example

```js
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
```

## Usage

As any other `typesmith` plugin, require it in your module and pass it to `typesmith.use()`:

```js
var typesmith = require('typesmith');
var autoparent = require('typesmith-autoparent');
... // require other plugins

var config = {
	... // config options and type info goes here
}

typesmith(config)
  .use(readJson())
  .use(readMarkdown())
  .use(autoparent())
  .use(subgroup())
  .use(writeJson())
  .use(writeHtml())
  .run( function(errmsg) { if (errmsg) { console.log("Error: " + errmsg); } console.log('finished!'); } );
```
