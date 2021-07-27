import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log(options); //apiKey,domain,fromemail확인
    //this.sendEmail('testing', 'test'); //NestJS가 시작할때마다 이함수를 테스트한다는것
    this.sendEmail('testing', 'test');
  }

  private async sendEmail(subject: string, content: string) {
    const form = new FormData();
    //form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('from', `mailgun@${this.options.domain}`);
    form.append('to', `heecheol.jeong87@gmail.com`);
    form.append('subject', subject);
    form.append('template', 'verify-email');
    form.append('v:code', 'asasas');
    form.append('v:username', 'heecheol!!!');
    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages/`,
      {
        //https: {
        //  rejectUnauthorized: false,
        //},
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      },
    );
    console.log(response.body); //mailgun의 내용을 알수있다.
    //console.log('a', response);
  }
}