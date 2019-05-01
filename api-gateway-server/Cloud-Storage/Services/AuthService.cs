using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Cloud_Storage.Models;

namespace Cloud_Storage.Services
{
    class AuthService : IAuthService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<User> getUser(String accessToken)
        {
            var client = _httpClientFactory.CreateClient("laravel");
            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", accessToken);
            var res = await client.GetAsync("api/user");
            if (!res.IsSuccessStatusCode) return null;
            var user = (await res.Content.ReadAsAsync<User>());
            return user;
        }
    }
}
