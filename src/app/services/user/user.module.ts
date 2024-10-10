export class UserModule {
  id: string;
  username: string;
  email: string;
  profilePicUrl: string;
  favoriteDrink: string;
  registerAgeInDays: string;

  constructor(User: UserModule){
    this.id = User.id;
    this.username = User.username;
    this.email = User.email;
    this.profilePicUrl = User.profilePicUrl;
    this.favoriteDrink = User.favoriteDrink;
    this.registerAgeInDays = User.registerAgeInDays;
  }
}


