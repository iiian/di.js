module.exports = {
    id: 'first-service', 
    dependencies: ['second-service'], 
    service: function(secondService) {
        const do_ee_a = 713,
            do_ee_b = 3;
        return {
            invoke: function () { 
                return secondService.exponentiate(do_ee_a, do_ee_b) 
            }
        }  
    }
};