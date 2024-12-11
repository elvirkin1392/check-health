import {getMessageTemplate} from './getMessageTemplate.tsx';
import {Command} from "../enums/Command.tsx";
import {CreateStatus} from "../enums/Statuses.tsx";

describe('getMessageTemplate', () => {
  test('getMessageTemplate', () => {
    expect(getMessageTemplate(Command.Start, {status: CreateStatus.Failed}))
      .toStrictEqual({ text: "Sorry but I couldn't create your profile. \nType 'bug_rescue' to get help from the beloved developer"});
  });
})