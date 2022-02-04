import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AuthService } from './pages/login/authservice';
import { TranslateService } from 'ng2-translate';
import { GlobalSettings } from '../app/shared/global/globalsettings';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  providers: [AuthService]
})

export class AppComponent implements OnInit {

  private subscription: Subscription;

  constructor(translate: TranslateService,
    private _authService: AuthService,
    private _router: Router,
    private elRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    private titleService: Title, private router: Router) {

    this.titleService.setTitle(GlobalSettings.TITLE);

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang(GlobalSettings.I18N_LANGUAGE);
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use(GlobalSettings.I18N_LANGUAGE);

    _router.events.subscribe(event => {
      
      if (event instanceof NavigationStart) {
        
        if (location.pathname.toLowerCase().startsWith("/vehicleinfo") || location.pathname == "/termandconditions" || location.pathname == "/privacypolicy"){
          return;
        }
        if (location.pathname == "/tenantregister") {
          if (this._authService.isOnline()) {
            localStorage.removeItem('auth_key');
            localStorage.removeItem('AppVersion');
            localStorage.removeItem('LoggedInUser');
            localStorage.removeItem('logo');
            localStorage.removeItem('logotext');
            this._authService.logout();
            this.router.navigate(['/tenantregister']);
          }        
        }
        else if (location.pathname != "/" && !location.pathname.toLowerCase().endsWith("login")) {

          if (this._authService.isOnline()) {
            //redirect url
          }
          else {
            this._authService.login();
          }
        }

      }
    });

  }

  ngOnInit() {
    $.material.options.autofill = true;
    $.material.init();
  }

  ngOnDestroy() {
    // prevent memory leak by unsubscribing
    this.subscription.unsubscribe();
  }

}
