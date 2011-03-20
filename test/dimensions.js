var testCase = require('../deps/nodeunit/lib/nodeunit').testCase,
static_document = require('fs').readFileSync('test/fixtures/dimensions.html');

// need to be global as helpers access these variables
window = document = jQuery = $ = null;

var helpers = require('./helpers/helper'),
q = helpers.query_ids;

function pass( val ) {
	return val;
}

function fn( val ) {
	return function(){ return val; };
}

function testWidth( test, val ) {
	test.expect(8);

	var $div = jQuery("#nothiddendiv");
	$div.width( val(30) );
	test.equals($div.width(), 30, "Test set to 30 correctly");
	$div.hide();
	test.equals($div.width(), 30, "Test hidden div");
	$div.show();
	$div.width( val(-1) ); // handle negative numbers by ignoring #1599
	test.equals($div.width(), 30, "Test negative width ignored");
	$div.css("padding", "20px");
	test.equals($div.width(), 30, "Test padding specified with pixels");
	$div.css("border", "2px solid #fff");
	test.equals($div.width(), 30, "Test border specified with pixels");

	$div.css({ display: "", border: "", padding: "" });

	jQuery("#nothiddendivchild").css({ width: 20, padding: "3px", border: "2px solid #fff" });
	test.equals(jQuery("#nothiddendivchild").width(), 20, "Test child width with border and padding");
	jQuery("#nothiddendiv, #nothiddendivchild").css({ border: "", padding: "", width: "" });

	var blah = jQuery("blah");
	test.equals( blah.width( val(10) ), blah, "Make sure that setting a width on an empty set returns the set." );
	test.equals( blah.width(), null, "Make sure 'null' is returned on an empty set");

	jQuery.removeData($div[0], 'olddisplay', true);
	test.done();
}


function testHeight( test, val ) {
	test.expect(8);

	var $div = jQuery("#nothiddendiv");
	$div.height( val(30) );
	test.equals($div.height(), 30, "Test set to 30 correctly");
	$div.hide();
	test.equals($div.height(), 30, "Test hidden div");
	$div.show();
	$div.height( val(-1) ); // handle negative numbers by ignoring #1599
	test.equals($div.height(), 30, "Test negative height ignored");
	$div.css("padding", "20px");
	test.equals($div.height(), 30, "Test padding specified with pixels");
	$div.css("border", "2px solid #fff");
	test.equals($div.height(), 30, "Test border specified with pixels");

	$div.css({ display: "", border: "", padding: "", height: "1px" });

	jQuery("#nothiddendivchild").css({ height: 20, padding: "3px", border: "2px solid #fff" });
	test.equals(jQuery("#nothiddendivchild").height(), 20, "Test child height with border and padding");
	jQuery("#nothiddendiv, #nothiddendivchild").css({ border: "", padding: "", height: "" });

	var blah = jQuery("blah");
	test.equals( blah.height( val(10) ), blah, "Make sure that setting a height on an empty set returns the set." );
	test.equals( blah.height(), null, "Make sure 'null' is returned on an empty set");

	jQuery.removeData($div[0], 'olddisplay', true);
	test.done();
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

	"width()": function(test) {
		testWidth( test, pass );
	},

	"width() with function": function(test) {
		testWidth( test, fn );
	},

	"width() with function args": function(test) {
		test.expect( 2 );

		var $div = jQuery("#nothiddendiv");
		$div.width( 30 ).width(function(i, width) {
			test.equals( width, 30, "Make sure previous value is corrrect." );
			return width + 1;
		});

		test.equals( $div.width(), 31, "Make sure value was modified correctly." );
		test.done();
	},

	"height()": function(test) {
		testHeight( test, pass );
	},

	"height() with function": function(test) {
		testHeight( test, fn );
	},

	"height() with function args": function(test) {
		test.expect( 2 );

		var $div = jQuery("#nothiddendiv");
		$div.height( 30 ).height(function(i, height) {
			test.equals( height, 30, "Make sure previous value is corrrect." );
			return height + 1;
		});

		test.equals( $div.height(), 31, "Make sure value was modified correctly." );
		test.done();
	},

	"innerWidth()": function(test) {
		test.expect(4);

		var $div = jQuery("#nothiddendiv");
		// set styles
		$div.css({
			margin: 10,
			border: "2px solid #fff",
			width: 30
		});

		test.equals($div.innerWidth(), 30, "Test with margin and border");
		$div.css("padding", "20px");
		test.equals($div.innerWidth(), 70, "Test with margin, border and padding");
		$div.hide();
		test.equals($div.innerWidth(), 70, "Test hidden div");

		// reset styles
		$div.css({ display: "", border: "", padding: "", width: "", height: "" });

		var div = jQuery( "<div>" );

		// Temporarily require 0 for backwards compat - should be auto
		test.equals( div.innerWidth(), 0, "Make sure that disconnected nodes are handled." );

		div.remove();
		jQuery.removeData($div[0], 'olddisplay', true);
		test.done();
	},

	"innerHeight()": function(test) {
		test.expect(4);

		var $div = jQuery("#nothiddendiv");
		// set styles
		$div.css({
			margin: 10,
			border: "2px solid #fff",
			height: 30
		});

		test.equals($div.innerHeight(), 30, "Test with margin and border");
		$div.css("padding", "20px");
		test.equals($div.innerHeight(), 70, "Test with margin, border and padding");
		$div.hide();
		test.equals($div.innerHeight(), 70, "Test hidden div");

		// reset styles
		$div.css({ display: "", border: "", padding: "", width: "", height: "" });

		var div = jQuery( "<div>" );

		// Temporarily require 0 for backwards compat - should be auto
		test.equals( div.innerHeight(), 0, "Make sure that disconnected nodes are handled." );

		div.remove();
		jQuery.removeData($div[0], 'olddisplay', true);
		test.done();
	},

	"outerWidth()": function(test) {
		test.expect(7);

		var $div = jQuery("#nothiddendiv");
		$div.css("width", 30);

		test.equals($div.outerWidth(), 30, "Test with only width set");
		$div.css("padding", "20px");
		test.equals($div.outerWidth(), 70, "Test with padding");
		$div.css("border", "2px solid #fff");
		test.equals($div.outerWidth(), 74, "Test with padding and border");
		$div.css("margin", "10px");
		test.equals($div.outerWidth(), 74, "Test with padding, border and margin without margin option");
		$div.css("position", "absolute");
		test.equals($div.outerWidth(true), 94, "Test with padding, border and margin with margin option");
		$div.hide();
		test.equals($div.outerWidth(true), 94, "Test hidden div with padding, border and margin with margin option");

		// reset styles
		$div.css({ position: "", display: "", border: "", padding: "", width: "", height: "" });

		var div = jQuery( "<div>" );

		// Temporarily require 0 for backwards compat - should be auto
		test.equals( div.outerWidth(), 0, "Make sure that disconnected nodes are handled." );

		div.remove();
		jQuery.removeData($div[0], 'olddisplay', true);
		test.done();
	},

	"outerHeight()": function(test) {
		test.expect(7);

		var $div = jQuery("#nothiddendiv");
		$div.css("height", 30);

		test.equals($div.outerHeight(), 30, "Test with only width set");
		$div.css("padding", "20px");
		test.equals($div.outerHeight(), 70, "Test with padding");
		$div.css("border", "2px solid #fff");
		test.equals($div.outerHeight(), 74, "Test with padding and border");
		$div.css("margin", "10px");
		test.equals($div.outerHeight(), 74, "Test with padding, border and margin without margin option");
		test.equals($div.outerHeight(true), 94, "Test with padding, border and margin with margin option");
		$div.hide();
		test.equals($div.outerHeight(true), 94, "Test hidden div with padding, border and margin with margin option");

		// reset styles
		$div.css({ display: "", border: "", padding: "", width: "", height: "" });

		var div = jQuery( "<div>" );

		// Temporarily require 0 for backwards compat - should be auto
		test.equals( div.outerHeight(), 0, "Make sure that disconnected nodes are handled." );

		div.remove();
		jQuery.removeData($div[0], 'olddisplay', true);
		test.done();
	}
});

