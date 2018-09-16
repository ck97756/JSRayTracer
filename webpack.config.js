const path = require('path');

module.exports = {
	entry: './src/main.js'
	, output: {
		filename: 'bundle.js'
		, path: path.resolve(__dirname, './dist')
	}
	, module: {
		rules: [
			{
				test: /\.worker\.js$/
				, use: {
					loader: 'worker-loader'
					, options: {
						name: 'worker.js'
					}
				}
			}
		]
	}
	, devtool: 'source-map'
};