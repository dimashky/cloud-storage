using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Cloud_Storage.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Cloud_Storage
{
    // You may need to install the Microsoft.AspNetCore.Http.Abstractions package into your project
    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthMiddleware(RequestDelegate next, IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
            _next = next;
        }

        public async Task Invoke(HttpContext httpContext)
        {
            string accessToken = httpContext.Request.Headers["Authorization"];
            var client = _httpClientFactory.CreateClient("laravel");
            client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", accessToken);
            var res = await client.GetAsync("api/user");
            if (!res.IsSuccessStatusCode) httpContext.Abort();
            var user = (await res.Content.ReadAsAsync<User>());
            if (user == null) httpContext.Abort();

            Console.WriteLine(httpContext.User.ToString());


            await _next(httpContext);
        }
    }

    // Extension method used to add the middleware to the HTTP request pipeline.
    public static class AuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseAuthMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AuthMiddleware>();
        }
    }
}
