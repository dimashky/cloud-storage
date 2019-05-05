using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Cloud_Storage.Models
{
    public class UploadRequest
    {
        public int owner_id { get; set; }
        public int parent_id { get; set; }
        public IFormFile file { get; set; }
        public string name { get; set; }
    }
}
