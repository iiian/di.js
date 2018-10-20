module.exports = {
    id: 'second-service', 
    dependencies: [], 
    service: function() {
        return {
            exponentiate: function(a,b) {
                return a ** b;
            }
        }
    }
};