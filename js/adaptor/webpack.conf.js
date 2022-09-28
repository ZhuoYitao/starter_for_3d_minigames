module.exports = {
  mode: "production",
  optimization: { minimize: true },
  entry: { game: './index.js' },
  output: { filename: '../web_adaptor.js' }
}
