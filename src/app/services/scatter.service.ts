import {Injectable} from '@angular/core';
import * as Eos from 'eosjs';
import {LocalStorage} from 'ngx-webstorage';
import {environment} from '../../environments/environment';

@Injectable()
export class ScatterService {
  @LocalStorage()
  identity: any;
  eos: any;
  scatter: any;
  network: any;

  load() {
    console.log(this.identity);
    this.scatter = (<any>window).scatter;
    if (this.identity) {
      this.scatter.useIdentity(this.identity.hash);
    }

    this.network = {
      blockchain:'eos',
      host: environment.eosHost,
      port:environment.eosPort,
      chainId:'8449f44ce9ba91e7b3da01900a6c6e49cd8466ceb43352f0902f6934dbfc9f4a'
    };
    this.eos = this.scatter.eos(this.network, Eos, {}, environment.eosProtocol);
  }

  login(successCallback, errorCallbak) {
    const requirements = {accounts:[this.network]};

    let that = this;
    this.scatter.getIdentity(requirements).then(
      function (identity) {
        if (!identity) {
          return errorCallbak(null);
        }
        that.identity = identity;
        that.scatter.useIdentity(identity.hash);
        successCallback();
      }
    ).catch(error => {
      errorCallbak(error);
    });
  }

  logout() {
    //this.scatter.forgetIdentity().then(() => { this.identity = null });
  }

  transfer(to: string, amount: number, memo: string = '', successCallback, errorCallback) {
    let that = this;
    this.login(function () {
        that.eos.transfer(that.identity.accounts[0].name, to, (amount).toString() + ' VEST', memo, []).then(transaction => {
          successCallback(transaction);
        }).catch(error => {
          errorCallback(error);
        });
      }, function (error) {
        errorCallback(error);
      }
    );
  }
}
