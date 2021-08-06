import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    //console.log(options); //apiKey,domain,fromemail확인
    //this.sendEmail('testing', 'test'); //NestJS가 시작할때마다 이함수를 테스트한다는것
    //this.sendEmail('testing', 'test');
  }

  async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ): Promise<boolean> {
    //console.log(got); mock을 보기위해서
    //console.log(FormData);
    const form = new FormData();
    //form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append(
      'from',
      `Heecheol from Huber Eats <mailgun@${this.options.domain}>`,
    );
    //form.append('to', `heecheol@w5.dion.ne.jp`);
    form.append('to', `heecheol153@gmail.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    //form.append('v:username', 'heecheol!!!');
    //emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          //method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      //console.log(error);
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
