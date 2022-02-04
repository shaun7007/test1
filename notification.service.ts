import { Injectable } from '@angular/core';



declare var $: any;


@Injectable()
export class NotifyService {



    showNotification(sMsg, sType) {
        $.notify({
            icon: "notifications",
            message: sMsg
        }, {
                type: sType,
                timer: 500,
                placement: {
                    from: 'bottom',
                    align: 'right'
                }
            });
    }

    
   
}