namespace DMI.XIP.wDTO
{
    public class ErrorMessageDTO
    {
        public ErrorMessageDTO() { }

        public ErrorMessageDTO(string code, string message) { this.Code = code;  this.Message = message; }
        public string Code { get; set; }
        public string Message { get; set; }
    } 
}
