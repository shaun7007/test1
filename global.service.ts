
import { tap, catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate';
import { AuditLogsModel } from '../../model/auditlogs/auditlogsModel';
import { AuthService } from 'app/pages/login/authservice';
import { GlobalSettings, CommonMethods, AlertType, AuditLogAction, AuditLogType, UserAction, ActionButtons, MainMenus } from '../global/globalsettings';
import { ApplicationInsightsService } from 'app/application-insights.service';

@Injectable()
export class GlobalService {

  public isBusy: boolean = false;//show/hide loader
  subscription: Subscription;
  public dateFormat = GlobalSettings.DATE_FORMAT;
  public dateFormatPipe = GlobalSettings.DATE_FORMAT_PIPE;
  public timeFormat = GlobalSettings.TIME_FORMAT;
  public dateFormatForDatePicker = GlobalSettings.DATE_FORMAT_FOR_DATEPICKER;
  public hideADDAsPerPermissions: boolean = false;
  public hideEDITAsPerPermissions: boolean = false;
  public hideDELETEAsPerPermissions: boolean = false;
  public hideREFERSHAsPerPermissions: boolean = false;
  public hideVIEWAsPerPermissions: boolean = false;
  public hideEXECUTEAsPerPermissions: boolean = false;
  public hideREADAsPerPermissions: boolean = false;
  public genralInfo: any;
  public subscriptionInfo: any;


  constructor(private _http: Http,
    private _authService: AuthService,
    private translate: TranslateService, private applicationInsightsService: ApplicationInsightsService) {
    this.dateFormat = GlobalSettings.DATE_FORMAT;
    this.dateFormatPipe = GlobalSettings.DATE_FORMAT_PIPE;
    this.timeFormat = GlobalSettings.TIME_FORMAT;
    this.dateFormatForDatePicker = GlobalSettings.DATE_FORMAT_FOR_DATEPICKER;
  }

  //get http request options
  public getRequestOptions(): RequestOptions {
    let HeaderString = {
      'Content-Type': 'application/json'
      , 'X-User-Tenant': GlobalSettings.TENANT
      , 'X-User-Token': GlobalSettings.USER_TOKEN
      , 'X-User-ID': this.getLoggedInUserInfo()
    };
    return new RequestOptions({ headers: new Headers(HeaderString) });
  }


  //get http request options
  public getInitialRequestOptions(): RequestOptions {
    let HeaderString = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('auth_key'),
      'X-User-Tenant': GlobalSettings.TENANT,
      'X-User-Token': GlobalSettings.USER_TOKEN,
      'X-User-ID': this.getLoggedInUserInfo()
    };
    return new RequestOptions({ headers: new Headers(HeaderString) });
  }

  //get assgined role and permission for user
  getAssignedRolesAndPermissions(userId: string): Observable<any> {
    return this._http.get(GlobalSettings.BASE_API_ENDPOINT_TENANT + "/getroleandpermissionsbyuserid?userId=" + userId,
      this.getInitialRequestOptions()).pipe(
        map((response: Response) => response.json()),
        catchError(this.handleErrorPromise));
  }

  //to register new user in ADB2C
  registerUser(model: any): Observable<any> {
    let body = JSON.stringify(model);
    return this._http.post(GlobalSettings.BASE_API_ENDPOINT_TENANT + "/users/register", body, this.getInitialRequestOptions()).pipe(
      map((response: Response) => response.json()),
      catchError(this.handleErrorPromise));
  }

  //to register new tenant with its user(Owner)
  registerTenant(model): Observable<any> {
    let body = JSON.stringify(model);
    return this._http.post(GlobalSettings.BASE_API_ENDPOINT_TENANT + '/registertenant', body, this.getRequestOptions()).pipe(
      map((response: Response) => response.json()),
      catchError(this.handleErrorPromise));
  }



  //get user information
  getUserInfo(): Observable<any> {
    return this._http.get(GlobalSettings.BASE_API_ENDPOINT_TENANT + "/getroleandpermissionsbyuserid?userId=" +
      this._authService.getUniqueID(), this.getInitialRequestOptions()).pipe(
        map((response: Response) => response.json()),
        catchError(this.handleErrorPromise));
  }

  //get configuration json from key
  getConfigJsonFromKey(configKey: string): Observable<any> {
    return this._http.get(GlobalSettings.BASE_API_ENDPOINT_TENANT + "/tenant/configs/key?key=" +
      configKey, this.getRequestOptions()).pipe(
        map((response: Response) => response.json()),
        catchError(this.handleErrorPromise));
  }

  //get App Version from Config
  public getAppVersion() {
    return this._http.get("./assets/json/commonconfig.json").pipe(
      map((response: Response) => response.json()),
      catchError(this.handleErrorPromise));
  }

  //get logged in user information
  getLoggedInUserInfo(): string {
    var userInfo = JSON.parse(localStorage.getItem('UserInfo'));
    if (userInfo != null) {
      return userInfo.User.UserID;
    }
    else {
      return "0";
    }
  }
  //get logged in user information
  getCurrentUserFullName(): string {
    var userInfo = JSON.parse(localStorage.getItem('UserInfo'));
    if (userInfo != null) {
      return userInfo.User.FirstName + ' ' + userInfo.User.LastName;
    }
    else {
      return "0";
    }
  }
  gettenantInfo(tenatId: string): Observable<any> {
    return this._http.get(GlobalSettings.BASE_API_ENDPOINT_TENANT + '/gettenantbyid/' + tenatId, this.getRequestOptions()).pipe(
      map((response: Response) => response.json()),
      catchError(this.handleErrorPromise));
  }

  //get transaltion from key
  getTranslate(skey: string, parameters: any = null) {
    var sResult = "";
    if (skey != "" && skey != null) {
      this.subscription = this.translate.get(skey, parameters).subscribe((val: string) => {
        sResult = val;
      });
    }
    return sResult;
  }

  //handle exceptions
  handleExceptions(e) {
    this.isBusy = false;
    this.applicationInsightsService.logError(e);
    CommonMethods.writeLogs(e, AlertType.Error);

  }

  //handle api error
  public handleApiError(e) {
    this.isBusy = false;
    CommonMethods.showAlert(this.getTranslate("Messages.ApiError"), AlertType.Error, this.getTranslate("AlertTitle.Error"));
    this.applicationInsightsService.logError(e);
    CommonMethods.writeLogs(e, AlertType.Error);
  }

  public setGenralInfo(v: any) {
    this.genralInfo = v;
  }

  public get getGenralInfo(): any {
    return this.genralInfo;
  }

  //public setRegistrationDetails(v: any) {
  //  this.registrationInfo = v;
  //}
  //public getRegistrationDetails() {
  //  return this.registrationInfo;
  //}

public resettoDefault(){
  this.hideADDAsPerPermissions = false;
  this.hideEDITAsPerPermissions = false;
  this.hideDELETEAsPerPermissions = false;
  this.hideREFERSHAsPerPermissions = false;
  this.hideVIEWAsPerPermissions = false;
  this.hideEXECUTEAsPerPermissions = false;
  this.hideREADAsPerPermissions = false;
}
  public get issubcribedUser(): any {

    let data = this.subscriptionInfo;

    let isSubscribed = false;
    if (data == undefined) {
      isSubscribed = undefined;
    }
    else if (data.IsPaymentReceived && data.SubscriptionType != 'Trial') {
      isSubscribed = true;
    }
    return isSubscribed;
  }

  public setSubscriptionInfo(v: any) {
    this.subscriptionInfo = v;
  }






  //handle api response
  public handleApiResponse(response: any, auditLogType: AuditLogType, auditLogAction: AuditLogAction, pageTitleKey: string = null,
    data: any = null, oldData: any = null, isPredefinedMessage: boolean = false, DisplayMessage: string = null) {

    let successTitle = this.getTranslate(auditLogAction == AuditLogAction.Add ? "AlertTitle.Saved" :
      auditLogAction == AuditLogAction.Update ? "AlertTitle.Updated" : auditLogAction == AuditLogAction.Delete ?
        "AlertTitle.Deleted" : "AlertTitle.Success");

    let errorTitle = this.getTranslate("AlertTitle.Error");

    let successMessage = null;
    if (isPredefinedMessage && pageTitleKey != null) {
      //if we want to show predefined message
      let actionKey = auditLogAction == AuditLogAction.Add ? "Messages.MessageAdded" :
        auditLogAction == AuditLogAction.Update ? "Messages.MessageUpdated" :
          auditLogAction == AuditLogAction.Delete ? "Messages.MessageDeleted" : "Messages.MessageSaved";

      successMessage = this.getTranslate("MessageFormatter.AddUpdateDeleteSuccessfull",
        { Value1: this.getTranslate(pageTitleKey), Value2: this.getTranslate(actionKey) });
    } else if (DisplayMessage != null) {
      //if we want to show our custom message
      successMessage = DisplayMessage
    }
    else {
      //if we want to show message sent by api
      successMessage = response.DisplayMessage
    }
    //this.applicationInsightsService.logEvent(auditLogAction,response);
    let body = '[' + JSON.stringify(response.result) + ']';
    this.applicationInsightsService.logTrace(body, { key: auditLogAction });

    //keep audit log for success response
    if (response != null && response.IsSuccess == undefined) {
      this.keepAuditLogs(auditLogType, auditLogAction, data, oldData);
    }


    //keep audit log for success response
    if (response != null && response.IsSuccess) {
      CommonMethods.handleApiResponse(response, auditLogAction, successTitle, errorTitle, successMessage);
      this.keepAuditLogs(auditLogType, auditLogAction, data, oldData);
    }
  }

  //get delete confirmation box settings with titles
  getDeleteConfirmationSetting(auditLogType: AuditLogType, pageTitle: string = null): any {
    let title = pageTitle == null || pageTitle == "" ? this.getTranslate("Messages.YouWantBeAbleToRevert") :
      this.getTranslate("MessageFormatter.YouWantDeleteToThis", { Value1: this.getTranslate(pageTitle) });
    return {
      title: this.getTranslate("Messages.AreYouSure"),
      text: title,
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this.getTranslate("ActionButton.Delete"),
      cancelButtonText: this.getTranslate("ActionButton.Cancel"),
      buttonsStyling: false,
      reverseButtons: true
    };
  }

  //get delete confirmation box settings with titles
  getDeleteCustomConfirmationSetting(title, pageTitle: string = null): any {
    let PageTitle = pageTitle == null || pageTitle == "" ? this.getTranslate("Messages.YouWantBeAbleToRevert") :
      this.getTranslate( this.getTranslate(pageTitle));
    return {
      title: this.getTranslate(title),
      text: PageTitle,
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this.getTranslate("ActionButton.Delete"),
      cancelButtonText: this.getTranslate("ActionButton.Cancel"),
      buttonsStyling: false,
      reverseButtons: true
    };
  }

  // get confirmation box settings with titles
  getConfirmationSetting(title: any = null, message: any = null, userAction: UserAction = UserAction.Discard): any {
    if (title == null) {
      title = this.getTranslate('Messages.AreYouSure');
    }
    if (message == null) {
      message = userAction == UserAction.Discard ? this.getTranslate('Messages.YouWantDiscardChanges') :
        this.getTranslate('Messages.YouWantSaveChanges');
    }
    return {
      title: title,
      text: message,
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: 'Yes',
      cancelButtonText: this.getTranslate('ActionButton.Cancel'),
      buttonsStyling: false,
      reverseButtons: true
    };
  }


  //get delete confirmation box settings with titles
  getCustomConfirmationSetting(titlemessage, OkButton, CancelButton,defaultmessage: string = null, pageTitle: string = null): any {
    let title = pageTitle == null || pageTitle == "" ? this.getTranslate(titlemessage) :
      this.getTranslate(defaultmessage, { Value1: this.getTranslate(pageTitle) });
    return {
      title: this.getTranslate("Messages.AreYouSure"),
      text: title,
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: this.getTranslate(OkButton),
      cancelButtonText: this.getTranslate(CancelButton),
      buttonsStyling: false,
      reverseButtons: true
    };
  }

  //keep audit log
  keepAuditLogs(auditLogType: AuditLogType, auditLogAction: AuditLogAction, data: any = null, oldData: any = null) {
    this.addAuditLog(auditLogType, auditLogAction, data, oldData).
      subscribe(response => {
      }, error => {
      });
  }

  /**
   * Method is used to keep Audit Logs for Actions
   * @param auditLogType 
   * @param auditLogAction 
   * @param data 
   * @param oldData 
   */
  addAuditLog(auditLogType: AuditLogType, auditLogAction: AuditLogAction, data: any = null, oldData: any = null):
    Observable<any> {

    let auditLogsModel: AuditLogsModel = new AuditLogsModel();

    auditLogsModel.Type = auditLogAction + " " + auditLogType;

    auditLogsModel.Logs = (data != null && oldData != null && data != "" && oldData != "") ?
      "{ 'ActionName' : '" + auditLogAction + " " + auditLogType + "' , 'Data' : '" + JSON.stringify(data) + "' , 'Old Data' : '" + JSON.stringify(oldData) + "' }" :
      (data != null && data != "") ? "{ 'ActionName' : '" + auditLogAction + " " + auditLogType + "' , 'Data' : '" + JSON.stringify(data) + "' }" :
        "{ 'ActionName' : '" + auditLogAction + " " + auditLogType + "' }";

    let body = '[' + JSON.stringify(auditLogsModel) + ']';
    //this.applicationInsightsService.logEvent(auditLogAction, { key: 'JSONString', Value: body });
    this.applicationInsightsService.logTrace(body, { key: auditLogAction });
    return this._http.post(GlobalSettings.BASE_API_ENDPOINT_TENANT + "/sync/postauditlogs", body, this.getRequestOptions()).pipe(
      map((response: Response) => response.json()),
      catchError(this.handleErrorPromise));
  }

  //handle api error
  public handleErrorPromise(error: any): Promise<any> {
    this.applicationInsightsService.logError(error);
    return Promise.reject(JSON.stringify(error));
  }

  //we are not using but kept it for reference purpose
  getparambygroup(group: string, lang: string): Observable<any> {
    return this._http.get(GlobalSettings.BASE_API_ENDPOINT + "api/losparapi/getbygroup?group=" + group + "&language=" + lang, this.getInitialRequestOptions()).pipe(
      map((response: Response) => response.json()),
      tap(data => console.log("All: " + JSON.stringify(data))),
      catchError(this.handleErrorPromise));
  }

  getparambyfile(file: string): Observable<any> {
    return this._http.get(GlobalSettings.BASE_API_ENDPOINT + "api/losparapi/getbyfile/" + file, this.getInitialRequestOptions()).pipe(
      map((response: Response) => response.json()),
      tap(data => console.log("All: " + JSON.stringify(data))),
      catchError(this.handleErrorPromise));
  }
  //end

  //checkActionPermissions For Logged in User
  CheckUserRolePermissionforPageActions(manuName, pageName, actionNamesList) {
    let actionPermissionsList = { PageName: "", ActionsName: [{ Name: "", IsGrant: false }] };
    //let isGetPermissions: boolean = false;
    try {
      var userInfo = JSON.parse(localStorage.getItem('UserInfo'));
      if (userInfo != undefined && userInfo != null) {
        var roleDTO = userInfo.RoleDTO;
        var menus = (roleDTO != undefined && roleDTO != null) ? roleDTO.PermissionDataInGroupDTO.Menu : roleDTO;
        if (menus != undefined && menus != null && menus.length > 0) {
          var menu = menus.filter(x => x.MenuPermissionConstantName.toUpperCase() == manuName.toUpperCase());
          if (menu != undefined && menu != null && menu.length > 0) {
            var subMenu = menu[0].SubMenu;
            if (subMenu != undefined && subMenu != null && subMenu.length > 0) {
              var permissions = subMenu.filter(x => x.SubMenuPermissionConstantName.toUpperCase() == this.getTranslate(pageName).toUpperCase());//[0].SubMenuPermissionDTO;              
              if (permissions != undefined && permissions != null && permissions.length > 0) {
                var actions = permissions[0].SubMenuPermissionDTO;//.filter(x => x.SubMenuTitle.toUpperCase() == this.getTranslate(pageName).toUpperCase());
                if (actions != undefined && actions != null && actions.length > 0) {
                  for (var m = 0; m < actionNamesList.length; m++) {
                    var checkPermission = actions.filter(x => x.SubMenuPermissionConstantName.toUpperCase().includes(actionNamesList[m].toUpperCase()) || x.SubMenuPermissionTitle.toUpperCase().includes(actionNamesList[m].toUpperCase()));
                    if (checkPermission != undefined && checkPermission != null && checkPermission.length > 0) {
                      actionPermissionsList.PageName = this.getTranslate(pageName);
                      actionPermissionsList.ActionsName.push({ Name: actionNamesList[m], IsGrant: true });
                    }
                    else {
                      actionPermissionsList.PageName = this.getTranslate(pageName);
                      actionPermissionsList.ActionsName.push({ Name: actionNamesList[m], IsGrant: false });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    catch (e) {
      CommonMethods.writeLogs(e, AlertType.Error);
    }
    return actionPermissionsList;
  }
  //end

  checkPermission(mainMenu, pageTitle) {
    try {
      let actionButtonsList = [ActionButtons.ADD, ActionButtons.EDIT, ActionButtons.DELETE, ActionButtons.VIEW, ActionButtons.REFRESH, ActionButtons.EXECUTE, ActionButtons.READ];//  'ActionButton.AddNew', 'ActionButton.Refresh', 'Edit', 'ActionButton.Delete'];
      let checkPermission = this.CheckUserRolePermissionforPageActions(mainMenu, pageTitle, actionButtonsList);
      if (checkPermission != undefined && checkPermission != null) {
        for (var i = 0; i < checkPermission.ActionsName.length; i++) {
          if (checkPermission.ActionsName[i].Name.toUpperCase() == ActionButtons.ADD) {
            this.hideADDAsPerPermissions = checkPermission.ActionsName[i].IsGrant;
          }
          else if (checkPermission.ActionsName[i].Name.toUpperCase() == ActionButtons.EDIT) {
            this.hideEDITAsPerPermissions = checkPermission.ActionsName[i].IsGrant;
          }
          else if (checkPermission.ActionsName[i].Name.toUpperCase() == ActionButtons.DELETE) {
            this.hideDELETEAsPerPermissions = checkPermission.ActionsName[i].IsGrant;
          }
          else if (checkPermission.ActionsName[i].Name.toUpperCase() == ActionButtons.VIEW) {
            this.hideVIEWAsPerPermissions = checkPermission.ActionsName[i].IsGrant;
          }
          else if (checkPermission.ActionsName[i].Name.toUpperCase() == ActionButtons.REFRESH) {
            this.hideREFERSHAsPerPermissions = checkPermission.ActionsName[i].IsGrant;
          }
          else if (checkPermission.ActionsName[i].Name.toUpperCase() == ActionButtons.EXECUTE) {
            this.hideEXECUTEAsPerPermissions = checkPermission.ActionsName[i].IsGrant;
          }
          else if (checkPermission.ActionsName[i].Name.toUpperCase() == ActionButtons.READ) {
            this.hideREADAsPerPermissions = checkPermission.ActionsName[i].IsGrant;
          }
        }
        console.log(this.getTranslate(pageTitle) + " -->ADD " + this.hideADDAsPerPermissions + " EDIT " + this.hideEDITAsPerPermissions + " DELETE " + this.hideDELETEAsPerPermissions + " EXECUTE " + this.hideEXECUTEAsPerPermissions + " READ " + this.hideREADAsPerPermissions);
      }
    } catch (e) {

    }
  }
  /* Trim Data */
  myTrim(x) {
    return x.replace(/^\s+|\s+$/gm, '');
  }

  getAPIResult(apiName: string): Observable<any> {
    return this._http.get(GlobalSettings.BASE_API_ENDPOINT_TENANT + apiName, this.getRequestOptions()).pipe(
      map((response: Response) => response.json()),
      catchError(this.handleErrorPromise));
  }

  postAPIResult(model: any, apiName: string) {
    const body = JSON.stringify(model);
    return this._http.post(GlobalSettings.BASE_API_ENDPOINT_TENANT + apiName, body, this.getRequestOptions()).pipe(
      map((response: Response) => response.json()),
      catchError(this.handleErrorPromise));
  }

  

}
