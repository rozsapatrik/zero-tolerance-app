/**
 * Module for user data.
 */
export class UserModule {
  id: string;
  username: string;
  email: string;
  profilePicUrl: string;
  registerAgeInDays: string;
  registerDate: Date;
  gender: string;
  weight: number;

  constructor(User: UserModule){
    this.id = User.id;
    this.username = User.username;
    this.email = User.email;
    this.profilePicUrl = User.profilePicUrl;
    this.registerAgeInDays = User.registerAgeInDays;
    this.registerDate = User.registerDate;
    this.gender = User.gender;
    this.weight = User.weight;
  }
}


