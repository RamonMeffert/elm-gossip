const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer')

module.exports = {
  plugins: [cssnano(), autoprefixer()],
};