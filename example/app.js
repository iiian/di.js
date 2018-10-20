module.exports = {
    dependencies: ['first-service'],
    app: function(firstService) {
        console.log('lets do some stuff');
        console.log(firstService.invoke());
    }
};