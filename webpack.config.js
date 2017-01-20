const webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	context: __dirname,
	entry: "./frontend/app",

	output: {
        filename: 'script.js'
	},

    watch: true,

	watchOptions: {
		aggregateTimeout: 100
	},
	
	devtool: 'source-map',
	
	plugins: [
		
		new webpack['NoErrorsPlugin'](),

        new ExtractTextPlugin('styles.css', {
            allChunks: true
        })

		/*new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: true,
				drop_console: true,
				unsafe: true
			}
		})*/
	],
	
	module: {
	  loaders: [
          {
              test: /\.js$/,
              loader: 'babel-loader',
              exclude: /angular/,
              query: {
                  presets: ['es2015']//,
                  //plugins: ['transform-runtime']
              }
          },{
              test: /\.scss$/,
              loader: ExtractTextPlugin.extract('style-loader', 'css-loader!resolve-url!sass-loader?sourceMap')
          },{
              test : /\.css$/,
              loader: 'style!css!'
          }
	  ]
	},

    devServer: {
        inline: true,
        port: 10000
    }
	
	
};