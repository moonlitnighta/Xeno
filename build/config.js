const path = require('path');
const babel = require('rollup-plugin-babel');
const config = require('../config.js');
const resolve = p => {
	return path.resolve(__dirname , '../' , p);
}

export default {
	input:resolve('src/index.js'),
	banner:config.banner,
	onwarn:function(warning){
		if(process.env.NODE_ENV == 'pro'){
			return 
		}
		 console.warn(warning.message);
	},

	output:{
		name:'Xeno',
		file:resolve('dist/xeno.js'),
		format:'umd'
	},

	plugins: [ babel({
      	"exclude": 'node_modules/**',
      	"presets": [
		    ["latest", {
		      "es2015": {
		        "modules": false
		      }
		    }]
		  ],
		"plugins": ["external-helpers"],
		"externalHelpers": false
    })]
}