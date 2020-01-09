/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Styles, { StylesProcessor } from '../../../src/view/styles';
import { addBorderStylesProcessor } from '../../../src/view/styles/borderstyles';

describe( 'Border styles normalization', () => {
	let styles;

	beforeEach( () => {
		const converter = new StylesProcessor();
		addBorderStylesProcessor( converter );
		styles = new Styles( converter );
	} );

	it( 'should parse border shorthand', () => {
		styles.setStyle( 'border:1px solid blue;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
		} );
	} );

	it( 'should parse border shorthand with only style', () => {
		styles.setStyle( 'border:solid;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: undefined, right: undefined, bottom: undefined, left: undefined },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: undefined, right: undefined, bottom: undefined, left: undefined }
		} );
	} );

	it( 'should parse border shorthand with other shorthands', () => {
		styles.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: '#ccc', right: 'blue', bottom: 'blue', left: '#665511' },
			style: { top: 'dotted', right: 'solid', bottom: 'solid', left: 'dashed' },
			width: { top: '7px', right: '1px', bottom: '1px', left: '2.7em' }
		} );
	} );

	it( 'should parse border longhand', () => {
		styles.setStyle( 'border-color: #f00 #ba2;' +
			'border-style: solid;' +
			'border-width: 1px;' +
			'border-bottom-width: 2px;' +
			'border-right-style: dotted;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: '#f00', right: '#ba2', bottom: '#f00', left: '#ba2' },
			style: { top: 'solid', right: 'dotted', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '2px', left: '1px' }
		} );
	} );

	it( 'should output inline shorthand rules #1', () => {
		styles.setStyle( 'border:1px solid blue;' );

		expect( styles.getInlineStyle() ).to.equal(
			'border-top:1px solid blue;border-right:1px solid blue;border-bottom:1px solid blue;border-left:1px solid blue;'
		);
		expect( styles.getInlineProperty( 'border-color' ) ).to.equal( 'blue' );
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '1px' );
	} );

	it( 'should output only defined inline styles', () => {
		styles.insertProperty( 'border-color', { top: 'blue' } );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue' }
		} );

		expect( styles.getInlineStyle( 'border' ) ).to.equal( 'border-top:blue;' );
		// TODO: expect( styles.hasProperty( 'border-top-color' ) ).to.be.true;
		// expect( styles.getInlineProperty( 'border-top-color' ) ).to.equal( 'blue' );
	} );

	it( 'should output inline shorthand rules #2', () => {
		styles.setStyle( 'border:1px solid blue;border-left:#665511 dashed 2.7em;border-top:7px dotted #ccc;' );

		expect( styles.getInlineStyle() ).to.equal(
			'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511;'
		);

		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.equal( '#ccc blue blue #665511' );
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'dotted solid solid dashed' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '7px 1px 1px 2.7em' );
	} );

	it( 'should parse border + border-position(only color defined)', () => {
		styles.setStyle( 'border:1px solid blue;border-left:#665511;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: '#665511' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
		} );
	} );

	it( 'should parse border + border-position(only style defined)', () => {
		styles.setStyle( 'border:1px solid blue;border-left:ridge;' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'ridge' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
		} );
	} );

	it( 'should parse border + border-position(only width defined)', () => {
		styles.setStyle( 'border:1px solid blue;border-left:1337px' );

		expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
			color: { top: 'blue', right: 'blue', bottom: 'blue', left: 'blue' },
			style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
			width: { top: '1px', right: '1px', bottom: '1px', left: '1337px' }
		} );
	} );

	it( 'should merge rules on insert other shorthand', () => {
		styles.setStyle( 'border:1px solid blue;' );
		styles.insertProperty( 'border-left', '#665511 dashed 2.7em' );
		styles.insertProperty( 'border-top', '7px dotted #ccc' );

		expect( styles.getInlineStyle() ).to.equal(
			'border-top:7px dotted #ccc;border-right:1px solid blue;border-bottom:1px solid blue;border-left:2.7em dashed #665511;'
		);
		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.equal( '#ccc blue blue #665511' );
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'dotted solid solid dashed' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '7px 1px 1px 2.7em' );
	} );

	it( 'should output', () => {
		styles.setStyle( 'border:1px solid blue;' );
		styles.removeProperty( 'border-color' );

		expect( styles.getInlineStyle() ).to.equal(
			'border-top:1px solid;border-right:1px solid;border-bottom:1px solid;border-left:1px solid;'
		);

		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '1px solid' );
		expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '1px solid' );
		expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '1px solid' );
		expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '1px solid' );
	} );

	it( 'should output border with only style shorthand (style)', () => {
		styles.setStyle( 'border:solid;' );

		expect( styles.getInlineStyle() ).to.equal( 'border-top:solid;border-right:solid;border-bottom:solid;border-left:solid;' );
		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-style' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-width' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-top' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-right' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( 'solid' );
		expect( styles.getInlineProperty( 'border-left' ) ).to.equal( 'solid' );
	} );

	it( 'should output border with only style shorthand (color)', () => {
		styles.setStyle( 'border:#f00;' );

		expect( styles.getInlineStyle() ).to.equal( 'border-top:#f00;border-right:#f00;border-bottom:#f00;border-left:#f00;' );
		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.equal( '#f00' );
		expect( styles.getInlineProperty( 'border-style' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-width' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '#f00' );
		expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '#f00' );
		expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '#f00' );
		expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '#f00' );
	} );

	it( 'should output border with only style shorthand (width)', () => {
		styles.setStyle( 'border:1px;' );

		expect( styles.getInlineStyle() ).to.equal( 'border-top:1px;border-right:1px;border-bottom:1px;border-left:1px;' );
		expect( styles.getInlineProperty( 'border' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-color' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-style' ) ).to.be.undefined;
		expect( styles.getInlineProperty( 'border-width' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '1px' );
		expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '1px' );
	} );

	describe( 'normalized values getters', () => {
		it( 'should output border-*-color', () => {
			styles.setStyle( 'border:1px solid #f00;' );

			[ 'top', 'right', 'bottom', 'left' ].forEach( position => {
				expect( styles.getNormalized( `border-${ position }-color` ) ).to.equal( '#f00' );
			} );
		} );

		it( 'should output border-*-width', () => {
			styles.setStyle( 'border:1px solid #f00;' );

			[ 'top', 'right', 'bottom', 'left' ].forEach( position => {
				expect( styles.getNormalized( `border-${ position }-width` ) ).to.equal( '1px' );
			} );
		} );

		it( 'should output border-*-style', () => {
			styles.setStyle( 'border:1px solid #f00;' );

			[ 'top', 'right', 'bottom', 'left' ].forEach( position => {
				expect( styles.getNormalized( `border-${ position }-style` ) ).to.equal( 'solid' );
			} );
		} );
	} );

	describe( 'border reducers', () => {
		it( 'should output border-top', () => {
			styles.setStyle( 'border:1px solid #f00' );

			expect( styles.getInlineProperty( 'border-top' ) ).to.equal( '1px solid #f00' );
		} );

		it( 'should output border-right', () => {
			styles.setStyle( 'border:1px solid #f00' );

			expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '1px solid #f00' );
		} );

		it( 'should output border-bottom', () => {
			styles.setStyle( 'border:1px solid #f00' );

			expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '1px solid #f00' );
		} );

		it( 'should output border-left', () => {
			styles.setStyle( 'border:1px solid #f00' );

			expect( styles.getInlineProperty( 'border-left' ) ).to.equal( '1px solid #f00' );
		} );
	} );

	describe( 'border-color', () => {
		it( 'should set all border colors (1 value defined)', () => {
			styles.setStyle( 'border-color:cyan;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				color: {
					top: 'cyan',
					right: 'cyan',
					bottom: 'cyan',
					left: 'cyan'
				}
			} );
		} );

		it( 'should set all border colors (2 values defined)', () => {
			styles.setStyle( 'border-color:cyan magenta;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				color: {
					top: 'cyan',
					right: 'magenta',
					bottom: 'cyan',
					left: 'magenta'
				}
			} );
		} );

		it( 'should set all border colors (3 values defined)', () => {
			styles.setStyle( 'border-color:cyan magenta pink;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				color: {
					top: 'cyan',
					right: 'magenta',
					bottom: 'pink',
					left: 'magenta'
				}
			} );
		} );

		it( 'should set all border colors (4 values defined)', () => {
			styles.setStyle( 'border-color:cyan magenta pink beige;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				color: {
					top: 'cyan',
					right: 'magenta',
					bottom: 'pink',
					left: 'beige'
				}
			} );
		} );

		it( 'should merge with border shorthand', () => {
			styles.setStyle( 'border:1px solid blue;border-color:cyan black;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				color: { top: 'cyan', right: 'black', bottom: 'cyan', left: 'black' },
				style: { top: 'solid', right: 'solid', bottom: 'solid', left: 'solid' },
				width: { top: '1px', right: '1px', bottom: '1px', left: '1px' }
			} );
		} );

		it( 'should parse #RGB color value', () => {
			styles.setStyle( 'border:#f00;' );

			expect( styles.getNormalized( 'border-color' ) ).to.deep.equal( {
				top: '#f00',
				right: '#f00',
				bottom: '#f00',
				left: '#f00'
			} );
		} );

		it( 'should parse #RGBA color value', () => {
			styles.setStyle( 'border:#f00A;' );

			expect( styles.getNormalized( 'border-color' ) ).to.deep.equal( {
				top: '#f00A',
				right: '#f00A',
				bottom: '#f00A',
				left: '#f00A'
			} );
		} );

		it( 'should parse rgb() color value', () => {
			styles.setStyle( 'border:rgb(0, 30%,35);' );

			expect( styles.getNormalized( 'border-color' ) ).to.deep.equal( {
				top: 'rgb(0, 30%, 35)',
				right: 'rgb(0, 30%, 35)',
				bottom: 'rgb(0, 30%, 35)',
				left: 'rgb(0, 30%, 35)'
			} );
		} );

		it( 'should parse hsl() color value', () => {
			styles.setStyle( 'border:hsl(0, 100%, 50%);' );

			expect( styles.getNormalized( 'border-color' ) ).to.deep.equal( {
				top: 'hsl(0, 100%, 50%)',
				right: 'hsl(0, 100%, 50%)',
				bottom: 'hsl(0, 100%, 50%)',
				left: 'hsl(0, 100%, 50%)'
			} );
		} );
	} );

	describe( 'border-style', () => {
		it( 'should set all border styles (1 value defined)', () => {
			styles.setStyle( 'border-style:solid;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				style: {
					top: 'solid',
					right: 'solid',
					bottom: 'solid',
					left: 'solid'
				}
			} );
		} );

		it( 'should set all border styles (2 values defined)', () => {
			styles.setStyle( 'border-style:solid dotted;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				style: {
					top: 'solid',
					right: 'dotted',
					bottom: 'solid',
					left: 'dotted'
				}
			} );
		} );

		it( 'should set all border styles (3 values defined)', () => {
			styles.setStyle( 'border-style:solid dotted dashed;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				style: {
					top: 'solid',
					right: 'dotted',
					bottom: 'dashed',
					left: 'dotted'
				}
			} );
		} );

		it( 'should set all border styles (4 values defined)', () => {
			styles.setStyle( 'border-style:solid dotted dashed ridge;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				style: {
					top: 'solid',
					right: 'dotted',
					bottom: 'dashed',
					left: 'ridge'
				}
			} );
		} );

		it( 'should parse none value', () => {
			styles.setStyle( 'border:none;' );

			expect( styles.getNormalized( 'border-style' ) ).to.deep.equal( {
				top: 'none',
				right: 'none',
				bottom: 'none',
				left: 'none'
			} );
		} );

		it( 'should parse line-style value', () => {
			styles.setStyle( 'border:solid;' );

			expect( styles.getNormalized( 'border-style' ) ).to.deep.equal( {
				top: 'solid',
				right: 'solid',
				bottom: 'solid',
				left: 'solid'
			} );
		} );

		it( 'should not parse non line-style value', () => {
			styles.setStyle( 'border:blue' );

			expect( styles.getNormalized( 'border-style' ) ).to.deep.equal( {
				top: undefined,
				right: undefined,
				bottom: undefined,
				left: undefined
			} );
		} );
	} );

	describe( 'border-width', () => {
		it( 'should set all border widths (1 value defined)', () => {
			styles.setStyle( 'border-width:1px;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				width: {
					top: '1px',
					right: '1px',
					bottom: '1px',
					left: '1px'
				}
			} );
		} );

		it( 'should set all border widths (2 values defined)', () => {
			styles.setStyle( 'border-width:1px .34cm;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				width: {
					top: '1px',
					right: '.34cm',
					bottom: '1px',
					left: '.34cm'
				}
			} );
		} );

		it( 'should set all border widths (3 values defined)', () => {
			styles.setStyle( 'border-width:1px .34cm 90.1rem;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				width: {
					top: '1px',
					right: '.34cm',
					bottom: '90.1rem',
					left: '.34cm'
				}
			} );
		} );

		it( 'should set all border widths (4 values defined)', () => {
			styles.setStyle( 'border-width:1px .34cm 90.1rem thick;' );

			expect( styles.getNormalized( 'border' ) ).to.deep.equal( {
				width: {
					top: '1px',
					right: '.34cm',
					bottom: '90.1rem',
					left: 'thick'
				}
			} );
		} );

		it( 'should parse px value', () => {
			styles.setStyle( 'border:1px;' );

			expect( styles.getNormalized( 'border-width' ) ).to.deep.equal( {
				top: '1px',
				right: '1px',
				bottom: '1px',
				left: '1px'
			} );
		} );

		it( 'should parse em value', () => {
			styles.setStyle( 'border:1em;' );

			expect( styles.getNormalized( 'border-width' ) ).to.deep.equal( {
				top: '1em',
				right: '1em',
				bottom: '1em',
				left: '1em'
			} );
		} );

		it( 'should parse thin value', () => {
			styles.setStyle( 'border:thin' );

			expect( styles.getNormalized( 'border-width' ) ).to.deep.equal( {
				top: 'thin',
				right: 'thin',
				bottom: 'thin',
				left: 'thin'
			} );
		} );

		it( 'should parse medium value', () => {
			styles.setStyle( 'border:medium' );

			expect( styles.getNormalized( 'border-width' ) ).to.deep.equal( {
				top: 'medium',
				right: 'medium',
				bottom: 'medium',
				left: 'medium'
			} );
		} );

		it( 'should parse thick value', () => {
			styles.setStyle( 'border:thick' );

			expect( styles.getNormalized( 'border-width' ) ).to.deep.equal( {
				top: 'thick',
				right: 'thick',
				bottom: 'thick',
				left: 'thick'
			} );
		} );
	} );

	describe( 'border-* position', () => {
		it( 'should output all positions', () => {
			styles.setStyle(
				'border-top:none;' +
				'border-left:none;' +
				'border-bottom:dotted #FFC000 3.0pt;' +
				'border-right:dotted #FFC000 3.0pt;'
			);

			expect( styles.getInlineStyle() ).to.equal(
				'border-top:none;border-right:3.0pt dotted #FFC000;border-bottom:3.0pt dotted #FFC000;border-left:none;'
			);
			expect( styles.getInlineProperty( 'border-top' ) ).to.equal( 'none' );
			expect( styles.getInlineProperty( 'border-right' ) ).to.equal( '3.0pt dotted #FFC000' );
			expect( styles.getInlineProperty( 'border-bottom' ) ).to.equal( '3.0pt dotted #FFC000' );
			expect( styles.getInlineProperty( 'border-left' ) ).to.equal( 'none' );
		} );
	} );

	describe( 'getStyleNames() - border', () => {
		it( 'should set all border colors (1 value defined)', () => {
			styles.setStyle( 'border-color: deeppink deepskyblue;' +
				'border-style: solid;' +
				'border-width: 1px;' +
				'border-bottom-width: 2px;' +
				'border-right-style: dotted;' );

			expect( styles.getStyleNames() ).to.deep.equal( [
				'border-top',
				'border-right',
				'border-bottom',
				'border-left'
			] );
		} );
	} );
} );
