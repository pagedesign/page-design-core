module.exports = function() {
    return {
        babelOptions: {
            plugins: [
                [
                    "babel-plugin-transform-react-remove-prop-types",
                    { mode: "wrap" }
                ]
            ]
        }
    };
};
