const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: './src/app.ts',
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: './dist',
        open: true,
        hot: true,
    },
};
