const _ = require('lodash');

module.exports = function ({
    method,
    program,
    ...deaults
}) {

    const opts = {
        // 自定义配置
    };

    return _.defaultsDeep(opts, deaults);
}