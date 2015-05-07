var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function ManifestPlugin() {
  this.opts = {
    fileName: 'manifest.json',
    imageExtenstions: /(jpe?g|png|gif|svg)$/i
  };
};

ManifestPlugin.prototype.getFileType = function(str) {
  return str.split('.').pop();
};

ManifestPlugin.prototype.apply = function(compiler) {
  var outputName = this.opts.fileName;
  var outputPath = path.join(compiler.options.output.path, outputName);

  var manifest = {};

  // compiler.plugin('done', function(stats){
  //   // images don't show up in assetsByChunkName.
  //   // we're getting them this way;
  //   _.merge(manifest, stats.assets.reduce(function(prevObj, asset){
  //     var ext = this.getFileType(asset.name);

  //     if (this.opts.imageExtenstions.test(ext)) {
  //       var trimmedName = asset.name.split('.').shift();
  //       prevObj[trimmedName + '.' + ext] = asset.name;
  //     }

  //     return prevObj;
  //   }.bind(this), {}))

  // }.bind(this));

  compiler.plugin('emit', function(c, callback) {
    _.merge(manifest, c.chunks.reduce(function(reducedObj, chunk){
      var name = chunk.name;
      var chunkName = chunk.files;

      if(Array.isArray(chunkName)) {
        var tmp = chunkName.reduce(function(prev, item){
          prev[name + '.' + this.getFileType(item)] = item;
          return prev;
        }.bind(this), {});
        return _.merge(reducedObj, tmp);
      }
      else {
        reducedObj[name + '.' + this.getFileType(chunkName)] = chunkName;
        return reducedObj;
      }
    }.bind(this), {}));

    var mjson = JSON.stringify(manifest, null, 2);;
    c.assets['manifest.json'] = {
      source: function() {
        return mjson;
      },

      size: function() {
        return mjson.length;
      }
    };
    callback();
  }.bind(this));
};

module.exports = ManifestPlugin;
