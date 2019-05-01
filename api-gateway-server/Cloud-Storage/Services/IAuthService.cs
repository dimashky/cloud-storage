using Cloud_Storage.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cloud_Storage.Services
{
    public interface IAuthService
    {
        Task<User> getUser(String accessToken);
    }
}
