
/** 
 * 根据指定名称获取分包对象
 * @param {object} subPackages 分包数组
 * @param {string} name        指定的分包名称
*/

exports.getSubPackIndexByName = (subPackages = [], name) => subPackages.map((pack, i) => pack.root === name ? i : -1).filter(i => i !== -1)[0];