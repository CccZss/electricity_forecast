const webpack = require('webpack')
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

var config = {
	entry: {
		index: './src/index.js',
		vendor: './src/vendor.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'js/[name].js',

	/**
	 * 打包文件时加在 chunk 引用地址前面的服务器路径
	 */
		publicPath: './',
		chunkFilename: '[id].js?[chunkhash]',
	},
  // 定义能够被打包的文件，文件后缀名 
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
	    	'~': path.resolve(__dirname, 'src')
	  	}
	},
	// 定义一些loaders
	module: {
		rules: [
			{
		        test: /\.html$/,
		        loader: 'html-loader?minimize=false&attrs[]=img:src&interpolate=require',  
		        exclude: path.resolve(__dirname, 'node_modules'),
				include: path.resolve(__dirname, 'src')
		    },
			{
				test: /\.js$/,
				use: 'babel-loader',
				exclude: path.resolve(__dirname, 'node_modules'),
				include: path.resolve(__dirname, 'src')
			},
			{
				test: /\.(ejs|tpl)$/,
				use: 'ejs-loader',
				exclude: path.resolve(__dirname, 'node_modules'),
				include: path.resolve(__dirname, 'src')
			},
						{
			 	test: /\.css$/,
			 	use: [
			 		'style-loader',
				  	{
				  		loader: 'css-loader',
				  		options: {
				  			importLoaders : 1,
				  			localIdentName: '[hash:base64:5]',
				  		}
				  	},
				  	{
			            loader: 'postcss-loader',
			            options: {
			              	plugins() {
				                return [
				                  require('precss'),
				                  require('autoprefixer')
				                ];
			              	}
			            }
			        }
			  	],
			  	exclude: path.resolve(__dirname, 'node_modules'),
				include: path.resolve(__dirname, 'src')
			},
			{
				test: /\.less$/,
				use: [
					'style-loader',
				  	{
				  		loader: 'css-loader',
				  		options: {
				  			localIdentName: '[hash:base64:5]',
				  		}
				  	},
				  	{
			            loader: 'postcss-loader',
			            options: {
			              	plugins() {
				                return [
				                  require('precss'),
				                  require('autoprefixer')
				                ];
			              	}
			            }
			        },
			        'less-loader'
				],
				exclude: path.resolve(__dirname, 'node_modules'),
				include: path.resolve(__dirname, 'src')
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				use: [
					{
						loader: 'url-loader',
						query: {
							limit: 10000,
							name: 'images/[name]-[hash:5].[ext]'
						}
					}

				],
				include: path.resolve(__dirname, 'src')
			}
		]
	},

	plugins: [

		new webpack.optimize.CommonsChunkPlugin({
	        names: ['vendor', 'manifest']
		}),

		/**
		 * 插件 HtmlWebpackPlugin ，用于根据提供的html模板自动生成html页面
		 * chunk 引用路径会自动添加到生成的html页面中
		 * 可在html中使用js解析模板 HtmlWebpackPlugin.files.chunk.entry.xxx
		 */
	    new HtmlWebpackPlugin({
		    filename: 'index.html',
		    template: './src/index.html',
		    inject: true,

		    /**
		     * 规定压缩方式
		     */
		  	minify: {
		    	removeComments: true,
		    	collapseWhitespace: true
		    }

		    /**
		     * 当有多个html页面时，默认情况下会把所有的 entry 定义的 chunk 都引入，
		     * 使用 chunks 属性能规定该页面只引入那些 chunk。
		     */
		    // chunks: ['index'],

		    /**
		     * 与chunks属性相反，排插掉不需要引入的chunk
		     */
		    // excludeChunks: ['index'],

		  })

	],

};

module.exports = config;
 

