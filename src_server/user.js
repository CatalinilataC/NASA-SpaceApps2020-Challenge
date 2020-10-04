

class User {
    //pt mai multi useri de fapt
    constructor()
    {
        this.ulist = new Map(); // key === sid and value === {}

    }
    Ulist()
    {
        return this.ulist;
    }
}

module.exports = new User();