using DMI.XIP.wDTO;
using log4net;
using Microsoft.ApplicationInsights.DataContracts;
using System;
using System.Collections.Generic;

namespace DMI.XIP.wAPI.Common
{
    /// <summary>
    /// 
    /// </summary>
    public static class ApiErrors
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="e"></param>
        /// <returns></returns>
        public static List<ErrorMessageDTO> GetErrors(Exception e)
        {
            List<ErrorMessageDTO> errorMessages = new List<ErrorMessageDTO>();
            if (e.Message.Contains("EntityValidationErrors"))
                errorMessages.Add(new ErrorMessageDTO() { Code = "500", Message = "Please enter correct data." });
            else
                errorMessages.Add(new ErrorMessageDTO() { Code = "500", Message = e.Message });


            return errorMessages;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="error"></param>
        /// <returns></returns>
        public static List<ErrorMessageDTO> GetErrors(string error)
        {
            List<ErrorMessageDTO> errorMessages = new List<ErrorMessageDTO>();
            errorMessages.Add(new ErrorMessageDTO() { Code = "500", Message = error });
            return errorMessages;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="e"></param>
        public static void ErorrLogging(Exception e)
        {
            ILog log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
            log.Error(e);

            var telemetry = new Microsoft.ApplicationInsights.TelemetryClient();
            TraceTelemetry traceTelemetry = new TraceTelemetry();
            traceTelemetry.Message = e.Message;
            traceTelemetry.SeverityLevel = SeverityLevel.Critical;
            traceTelemetry.Timestamp = DateTimeOffset.Now.UtcDateTime;
            traceTelemetry.Properties.Add("@Application", e.Source);
            if (e.InnerException != null)
            {
                traceTelemetry.Properties.Add("@InnerException", Convert.ToString(e.InnerException.Message));
                if (e.InnerException.InnerException != null)
                {
                    traceTelemetry.Properties.Add("@InnerException.InnerException", Convert.ToString(e.InnerException.InnerException.Message));
                }
            }
            traceTelemetry.Properties.Add("@StackTrace", e.StackTrace);
            telemetry.TrackTrace(traceTelemetry);
        }
        
        
          public static void ADDLogs(string callingFunction, string message)
        {
            //Store log in Application insight
            var telemetry = new Microsoft.ApplicationInsights.TelemetryClient();
            TraceTelemetry traceTelemetry = new TraceTelemetry();
            traceTelemetry.Message = message;
            traceTelemetry.SeverityLevel = SeverityLevel.Information;
            traceTelemetry.Timestamp = DateTime.Now;
            traceTelemetry.Properties.Add("@Application", callingFunction);
            telemetry.TrackTrace(traceTelemetry);

        }

    }
}

