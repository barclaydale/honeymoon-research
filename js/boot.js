/* Loads core + all island data + shared UI, in a fixed order, from any page. */
(function () {
  var files = ["js/core.js"];
  ["tahiti", "moorea", "borabora", "huahine", "raiatea", "tahaa", "maupiti", "rangiroa", "fakarava", "tikehau", "nukuhiva", "tetiaroa"].forEach(function (id) { files.push("data/" + id + ".js"); });
  files.push("js/ui.js");
  files.forEach(function (f) { document.write('<script src="' + f + '"><\/script>'); });
})();
