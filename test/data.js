var testCase = require('../deps/nodeunit/lib/nodeunit').testCase,
static_document = require('fs').readFileSync('test/fixtures/data.html');

// need to be global as helpers access these variables
window = document = jQuery = $ = null;

var helpers = require('./helpers/helper'),
q = helpers.query_ids;

function dataTests (test,elem) {
	// test.expect(32)

	function getCacheLength() {
		var cacheLength = 0;
		for (var i in jQuery.cache) {
			++cacheLength;
		}

		return cacheLength;
	}

	test.equals( jQuery.data(elem, "foo"), undefined, "No data exists initially" );
	test.strictEqual( jQuery.hasData(elem), false, "jQuery.hasData agrees no data exists initially" );

	var dataObj = jQuery.data(elem);
	test.equals( typeof dataObj, "object", "Calling data with no args gives us a data object reference" );
	test.strictEqual( jQuery.data(elem), dataObj, "Calling jQuery.data returns the same data object when called multiple times" );

	test.strictEqual( jQuery.hasData(elem), false, "jQuery.hasData agrees no data exists even when an empty data obj exists" );

	dataObj.foo = "bar";
	test.equals( jQuery.data(elem, "foo"), "bar", "Data is readable by jQuery.data when set directly on a returned data object" );

	test.strictEqual( jQuery.hasData(elem), true, "jQuery.hasData agrees data exists when data exists" );

	jQuery.data(elem, "foo", "baz");
	test.equals( jQuery.data(elem, "foo"), "baz", "Data can be changed by jQuery.data" );
	test.equals( dataObj.foo, "baz", "Changes made through jQuery.data propagate to referenced data object" );

	jQuery.data(elem, "foo", undefined);
	test.equals( jQuery.data(elem, "foo"), "baz", "Data is not unset by passing undefined to jQuery.data" );

	jQuery.data(elem, "foo", null);
	test.strictEqual( jQuery.data(elem, "foo"), null, "Setting null using jQuery.data works OK" );

	jQuery.data(elem, "foo", "foo1");

	jQuery.data(elem, { "bar" : "baz", "boom" : "bloz" });
	test.strictEqual( jQuery.data(elem, "foo"), "foo1", "Passing an object extends the data object instead of replacing it" );
	test.equals( jQuery.data(elem, "boom"), "bloz", "Extending the data object works" );

	jQuery._data(elem, "foo", "foo2");
	test.equals( jQuery._data(elem, "foo"), "foo2", "Setting internal data works" );
	test.equals( jQuery.data(elem, "foo"), "foo1", "Setting internal data does not override user data" );

	var internalDataObj = jQuery.data(elem, jQuery.expando);
	test.strictEqual( jQuery._data(elem), internalDataObj, "Internal data object is accessible via jQuery.expando property" );
	test.notStrictEqual( dataObj, internalDataObj, "Internal data object is not the same as user data object" );

	test.strictEqual( elem.boom, undefined, "Data is never stored directly on the object" );

	jQuery.removeData(elem, "foo");
	test.strictEqual( jQuery.data(elem, "foo"), undefined, "jQuery.removeData removes single properties" );

	jQuery.removeData(elem);
	test.strictEqual( jQuery.data(elem, jQuery.expando), internalDataObj, "jQuery.removeData does not remove internal data if it exists" );

	jQuery.removeData(elem, undefined, true);

	test.strictEqual( jQuery.data(elem, jQuery.expando), undefined, "jQuery.removeData on internal data works" );
	test.strictEqual( jQuery.hasData(elem), false, "jQuery.hasData agrees all data has been removed from object" );

	jQuery._data(elem, "foo", "foo2");
	test.strictEqual( jQuery.hasData(elem), true, "jQuery.hasData shows data exists even if it is only internal data" );

	jQuery.data(elem, "foo", "foo1");
	test.equals( jQuery._data(elem, "foo"), "foo2", "Setting user data does not override internal data" );

	jQuery.removeData(elem, undefined, true);
	test.equals( jQuery.data(elem, "foo"), "foo1", "jQuery.removeData for internal data does not remove user data" );

	if (elem.nodeType) {
		var oldCacheLength = getCacheLength();
		jQuery.removeData(elem, "foo");

		test.equals( getCacheLength(), oldCacheLength - 1, "Removing the last item in the data object destroys it" );
	}
	else {
		jQuery.removeData(elem, "foo");
		var expected, actual;

		if (jQuery.support.deleteExpando) {
			expected = false;
			actual = jQuery.expando in elem;
		}
		else {
			expected = null;
			actual = elem[ jQuery.expando ];
		}

		test.equals( actual, expected, "Removing the last item in the data object destroys it" );
	}

	jQuery.data(elem, "foo", "foo1");
	jQuery._data(elem, "foo", "foo2");

	test.equals( jQuery.data(elem, "foo"), "foo1", "(sanity check) Ensure data is set in user data object" );
	test.equals( jQuery._data(elem, "foo"), "foo2", "(sanity check) Ensure data is set in internal data object" );

	jQuery.removeData(elem, "foo", true);

	test.strictEqual( jQuery.data(elem, jQuery.expando), undefined, "Removing the last item in internal data destroys the internal data object" );

	jQuery._data(elem, "foo", "foo2");
	test.equals( jQuery._data(elem, "foo"), "foo2", "(sanity check) Ensure data is set in internal data object" );

	jQuery.removeData(elem, "foo");
	test.equals( jQuery._data(elem, "foo"), "foo2", "(sanity check) jQuery.removeData for user data does not remove internal data" );

	if (elem.nodeType) {
		oldCacheLength = getCacheLength();
		jQuery.removeData(elem, "foo", true);
		test.equals( getCacheLength(), oldCacheLength - 1, "Removing the last item in the internal data object also destroys the user data object when it is empty" );
	}
	else {
		jQuery.removeData(elem, "foo", true);

		if (jQuery.support.deleteExpando) {
			expected = false;
			actual = jQuery.expando in elem;
		}
		else {
			expected = null;
			actual = elem[ jQuery.expando ];
		}

		test.equals( actual, expected, "Removing the last item in the internal data object also destroys the user data object when it is empty" );
	}
}


module.exports = testCase({
	setUp: function (callback) {
		helpers.recreate_doc(static_document);
		callback();
	},
	tearDown: function (callback) {
		// clean up
		callback();
	},
	"expando": function(test) {
		test.expect(1);

		test.equals("expando" in jQuery, true, "jQuery is exposing the expando");
		test.done();
	},

	"jQuery.data": function(test) {
		test.expect(128);

		var div = document.createElement("div");

		dataTests(test,div);
		dataTests(test,{});

		// remove bound handlers from window object to stop potential false positives caused by fix for #5280 in
		// transports/xhr.js
		jQuery(window).unbind("unload");

		dataTests(test,window);
		dataTests(test,document);

		// clean up unattached element
		jQuery(div).remove();
		test.done();
	},

	"jQuery.acceptData": function(test) {
		test.expect(7);

		test.ok( jQuery.acceptData( document ), "document" );
		test.ok( jQuery.acceptData( document.documentElement ), "documentElement" );
		test.ok( jQuery.acceptData( {} ), "object" );
		test.ok( !jQuery.acceptData( document.createElement("embed") ), "embed" );
		test.ok( !jQuery.acceptData( document.createElement("applet") ), "applet" );

		var flash = document.createElement("object");
		flash.setAttribute("classid", "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000");
		test.ok( jQuery.acceptData( flash ), "flash" );

		var applet = document.createElement("object");
		applet.setAttribute("classid", "clsid:8AD9C840-044E-11D1-B3E9-00805F499D93");
		test.ok( !jQuery.acceptData( applet ), "applet" );
		test.done();
	},

	".data()": function(test) {
		test.expect(6);
		var div = jQuery("#foo");
		test.strictEqual( div.data("foo"), undefined, "Make sure that missing result is undefined" );
		div.data("test", "success");

		var dataObj = div.data();
		test.ok( dataObj, "Make sure dataObj exists");

		// TODO: Remove this hack which was introduced in 1.5.1
		delete dataObj.toJSON;

		test.same( dataObj, {test: "success"}, "data() get the entire data object" );
		test.strictEqual( div.data("foo"), undefined, "Make sure that missing result is still undefined" );

		var nodiv = jQuery("#unfound");
		test.equals( nodiv.data(), null, "data() on empty set returns null" );

		var obj = { foo: "bar" };
		jQuery(obj).data("foo", "baz");

		dataObj = jQuery.extend(true, {}, jQuery(obj).data());

		// TODO: Remove this hack which was introduced for 1.5.1
		delete dataObj.toJSON;

		test.deepEqual( dataObj, { foo: "baz" }, "Retrieve data object from a wrapped JS object (#7524)" );
		test.done();
	},

	".data(String) and .data(String, Object)": function(test) {
		test.expect(29);
		var parent = jQuery("<div><div></div></div>"),
		div = parent.children();

		parent
		.bind("getData", function(){ test.ok( false, "getData bubbled." ) })
		.bind("setData", function(){ test.ok( false, "setData bubbled." ) })
		.bind("changeData", function(){ test.ok( false, "changeData bubbled." ) });

		test.ok( div.data("test") === undefined, "Check for no data exists" );

		div.data("test", "success");
		test.equals( div.data("test"), "success", "Check for added data" );

		div.data("test", "overwritten");
		test.equals( div.data("test"), "overwritten", "Check for overwritten data" );

		div.data("test", undefined);
		test.equals( div.data("test"), "overwritten", "Check that data wasn't removed");

		div.data("test", null);
		test.ok( div.data("test") === null, "Check for null data");

		test.ok( div.data("notexist") === undefined, "Check for no data exists" );

		div.data("test", "overwritten");
		var hits = {test:0}, gets = {test:0}, changes = {test:0, value:null};


		function logChangeData(e,key,value) {
			var dataKey = key;
			if ( e.namespace ) {
				dataKey = dataKey + "." + e.namespace;
			}
			changes[key] += value;
			changes.value = jQuery.data(e.target, dataKey);
		}

		div
		.bind("setData",function(e,key,value){ hits[key] += value; })
		.bind("setData.foo",function(e,key,value){ hits[key] += value; })
		.bind("changeData",logChangeData)
		.bind("changeData.foo",logChangeData)
		.bind("getData",function(e,key){ gets[key] += 1; })
		.bind("getData.foo",function(e,key){ gets[key] += 3; });

		div.data("test.foo", 2);
		test.equals( div.data("test"), "overwritten", "Check for original data" );
		test.equals( div.data("test.foo"), 2, "Check for namespaced data" );
		test.equals( div.data("test.bar"), "overwritten", "Check for unmatched namespace" );
		test.equals( hits.test, 2, "Check triggered setter functions" );
		test.equals( gets.test, 5, "Check triggered getter functions" );
		test.equals( changes.test, 2, "Check sets raise changeData");
		test.equals( changes.value, 2, "Check changeData after data has been set" );

		hits.test = 0;
		gets.test = 0;
		changes.test = 0;
		changes.value = null;

		div.data("test", 1);
		test.equals( div.data("test"), 1, "Check for original data" );
		test.equals( div.data("test.foo"), 2, "Check for namespaced data" );
		test.equals( div.data("test.bar"), 1, "Check for unmatched namespace" );
		test.equals( hits.test, 1, "Check triggered setter functions" );
		test.equals( gets.test, 5, "Check triggered getter functions" );
		test.equals( changes.test, 1, "Check sets raise changeData" );
		test.equals( changes.value, 1, "Check changeData after data has been set" );

		div
		.bind("getData",function(e,key){ return key + "root"; })
		.bind("getData.foo",function(e,key){ return key + "foo"; });

		test.equals( div.data("test"), "testroot", "Check for original data" );
		test.equals( div.data("test.foo"), "testfoo", "Check for namespaced data" );
		test.equals( div.data("test.bar"), "testroot", "Check for unmatched namespace" );

		// #3748
		var $elem = jQuery({exists:true});
		test.equals( $elem.data('nothing'), undefined, "Non-existent data returns undefined");
		test.equals( $elem.data('null',null).data('null'), null, "null's are preserved");
		test.equals( $elem.data('emptyString','').data('emptyString'), '', "Empty strings are preserved");
		test.equals( $elem.data('false',false).data('false'), false, "false's are preserved");
		test.equals( $elem.data('exists'), undefined, "Existing data is not returned" );

		// Clean up
		$elem.removeData();
		test.deepEqual( $elem[0], {exists:true}, "removeData does not clear the object" );

		// manually clean up detached elements
		parent.remove();
		test.done();
	},

	"data-* attributes": function(test) {
		test.expect(37);
		var div = jQuery("<div>"),
		child = jQuery("<div data-myobj='old data' data-ignored=\"DOM\" data-other='test'></div>"),
		dummy = jQuery("<div data-myobj='old data' data-ignored=\"DOM\" data-other='test'></div>");

		test.equals( div.data("attr"), undefined, "Check for non-existing data-attr attribute" );

		div.attr("data-attr", "exists");
		test.equals( div.data("attr"), "exists", "Check for existing data-attr attribute" );

		div.attr("data-attr", "exists2");
		test.equals( div.data("attr"), "exists", "Check that updates to data- don't update .data()" );

		div.data("attr", "internal").attr("data-attr", "external");
		test.equals( div.data("attr"), "internal", "Check for .data('attr') precedence (internal > external data-* attribute)" );

		div.remove();

		child.appendTo('#main');
		test.equals( child.data("myobj"), "old data", "Value accessed from data-* attribute");

		child.data("myobj", "replaced");
		test.equals( child.data("myobj"), "replaced", "Original data overwritten");

		child.data("ignored", "cache");
		test.equals( child.data("ignored"), "cache", "Cached data used before DOM data-* fallback");

		var obj = child.data(), obj2 = dummy.data(), check = [ "myobj", "ignored", "other" ], num = 0, num2 = 0;

		dummy.remove();

		for ( var i = 0, l = check.length; i < l; i++ ) {
			test.ok( obj[ check[i] ], "Make sure data- property exists when calling data-." );
			test.ok( obj2[ check[i] ], "Make sure data- property exists when calling data-." );
		}

		for ( var prop in obj ) {
			num++;
		}

		test.equals( num, check.length, "Make sure that the right number of properties came through." );

		for ( var prop in obj2 ) {
			num2++;
		}

		test.equals( num2, check.length, "Make sure that the right number of properties came through." );

		child.attr("data-other", "newvalue");

		test.equals( child.data("other"), "test", "Make sure value was pulled in properly from a .data()." );

		child
		.attr("data-true", "true")
		.attr("data-false", "false")
		.attr("data-five", "5")
		.attr("data-point", "5.5")
		.attr("data-pointe", "5.5E3")
		.attr("data-pointbad", "5..5")
		.attr("data-pointbad2", "-.")
		.attr("data-badjson", "{123}")
		.attr("data-badjson2", "[abc]")
		.attr("data-empty", "")
		.attr("data-space", " ")
		.attr("data-null", "null")
		.attr("data-string", "test");

		test.strictEqual( child.data('true'), true, "Primitive true read from attribute");
		test.strictEqual( child.data('false'), false, "Primitive false read from attribute");
		test.strictEqual( child.data('five'), 5, "Primitive number read from attribute");
		test.strictEqual( child.data('point'), 5.5, "Primitive number read from attribute");
		test.strictEqual( child.data('pointe'), 5500, "Primitive number read from attribute");
		test.strictEqual( child.data('pointbad'), "5..5", "Bad number read from attribute");
		test.strictEqual( child.data('pointbad2'), "-.", "Bad number read from attribute");
		test.strictEqual( child.data('badjson'), "{123}", "Bad number read from attribute");
		test.strictEqual( child.data('badjson2'), "[abc]", "Bad number read from attribute");
		test.strictEqual( child.data('empty'), "", "Empty string read from attribute");
		test.strictEqual( child.data('space'), " ", "Empty string read from attribute");
		test.strictEqual( child.data('null'), null, "Primitive null read from attribute");
		test.strictEqual( child.data('string'), "test", "Typical string read from attribute");

		child.remove();

		// tests from metadata plugin
		function testData(index, elem) {
			switch (index) {
			case 0:
				test.equals(jQuery(elem).data("foo"), "bar", "Check foo property");
				test.equals(jQuery(elem).data("bar"), "baz", "Check baz property");
				break;
			case 1:
				test.equals(jQuery(elem).data("test"), "bar", "Check test property");
				test.equals(jQuery(elem).data("bar"), "baz", "Check bar property");
				break;
			case 2:
				test.equals(jQuery(elem).data("zoooo"), "bar", "Check zoooo property");
				test.same(jQuery(elem).data("bar"), {"test":"baz"}, "Check bar property");
				break;
			case 3:
				test.equals(jQuery(elem).data("number"), true, "Check number property");
				test.same(jQuery(elem).data("stuff"), [2,8], "Check stuff property");
				break;
			default:
				test.ok(false, ["Assertion failed on index ", index, ", with data ", data].join(''));
			}
		}

		var metadata = '<ol><li class="test test2" data-foo="bar" data-bar="baz" data-arr="[1,2]">Some stuff</li><li class="test test2" data-test="bar" data-bar="baz">Some stuff</li><li class="test test2" data-zoooo="bar" data-bar=\'{"test":"baz"}\'>Some stuff</li><li class="test test2" data-number=true data-stuff="[2,8]">Some stuff</li></ol>',
		elem = jQuery(metadata).appendTo('#main');

		elem.find("li").each(testData);
		elem.remove();
		test.done();
	},

	".data(Object)": function(test) {
		test.expect(4);

		var div = jQuery("<div/>");

		div.data({ "test": "in", "test2": "in2" });
		test.equals( div.data("test"), "in", "Verify setting an object in data" );
		test.equals( div.data("test2"), "in2", "Verify setting an object in data" );

		var obj = {test:"unset"},
		jqobj = jQuery(obj);
		jqobj.data("test", "unset");
		jqobj.data({ "test": "in", "test2": "in2" });
		test.equals( jQuery.data(obj).test, "in", "Verify setting an object on an object extends the data object" );
		test.equals( obj.test2, undefined, "Verify setting an object on an object does not extend the object" );

		// manually clean up detached elements
		div.remove();
		test.done();
	},

	"jQuery.removeData": function(test) {
		test.expect(6);
		var div = jQuery("#foo")[0];
		jQuery.data(div, "test", "testing");
		jQuery.removeData(div, "test");
		test.equals( jQuery.data(div, "test"), undefined, "Check removal of data" );

		jQuery.data(div, "test2", "testing");
		jQuery.removeData( div );
		test.ok( !jQuery.data(div, "test2"), "Make sure that the data property no longer exists." );
		test.ok( !div[ jQuery.expando ], "Make sure the expando no longer exists, as well." );

		var obj = {};
		jQuery.data(obj, "test", "testing");
		test.equals( jQuery(obj).data("test"), "testing", "verify data on plain object");
		jQuery.removeData(obj, "test");
		test.equals( jQuery.data(obj, "test"), undefined, "Check removal of data on plain object" );

		jQuery.data( window, "BAD", true );
		jQuery.removeData( window, "BAD" );
		test.ok( !jQuery.data( window, "BAD" ), "Make sure that the value was not still set." );
		test.done();
	},

	".removeData()": function(test) {
		test.expect(6);
		var div = jQuery("#foo");
		div.data("test", "testing");
		div.removeData("test");
		test.equals( div.data("test"), undefined, "Check removal of data" );

		div.data("test", "testing");
		div.data("test.foo", "testing2");
		div.removeData("test.bar");
		test.equals( div.data("test.foo"), "testing2", "Make sure data is intact" );
		test.equals( div.data("test"), "testing", "Make sure data is intact" );

		div.removeData("test");
		test.equals( div.data("test.foo"), "testing2", "Make sure data is intact" );
		test.equals( div.data("test"), undefined, "Make sure data is intact" );

		div.removeData("test.foo");
		test.equals( div.data("test.foo"), undefined, "Make sure data is intact" );
		test.done();
	}
});

