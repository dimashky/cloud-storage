using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cloud_Storage.Models
{
    public class User
    {
        public string email { get; set; }
        public string name { get; set; }
        public string accessToken { get; set; }
        private string password { get; set; }



        public User(string email, string password, string name)
        {
            this.email = email;
            this.password = password;
            this.name = name;
        }
    }
}
