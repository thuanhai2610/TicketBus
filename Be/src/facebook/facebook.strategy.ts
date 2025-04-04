
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
        clientID: configService.get<string>('FACEBOOK_CLIENT_ID'),
        clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3001/facebook/callback',
      scope: ['email'], 
      profileFields: ['id', 'emails', 'name'], 
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    try {
      console.log('Facebook profile:', profile);

      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('Email not provided by Facebook'), null);
      }

      // Check if user exists by email
      let user = await this.usersService.findByEmail(email);
      if (!user) {
        // Create a new user if they don't exist
        user = await this.usersService.create(
          profile.id, // Use Facebook ID as username
          accessToken, // Store access token (or generate a random password)
          email,
          'user', // Default role
          true, // Email is verified by Facebook
          true, // Password is already "hashed" (not really hashed, just a placeholder)
        );
        console.log('New user created from Facebook login:', user._id);
      }

      return done(null, user);
    } catch (error) {
      console.error('Error in Facebook strategy:', error);
      return done(error, null);
    }
  }
}