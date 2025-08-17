<div align="center">
  <a href="https://aniwheel.moe">
    <img width="500" height="167" alt="Aniwheel banner" src="https://github.com/user-attachments/assets/15e736c0-422b-4b17-90ce-b97460381cbb" />
  </a>
</div>
<br />
<h1 align="center">Your Anime Wheel of Fortune</h1>

### Aniwheel is an app created for those who can't decide which anime from their planning list to watch next. 🤔
#### Simply select your nominees, spin the wheel and let fortune decide! 🍀
<br />

## Features ⭐

- MyAnimeList and AniList support
- Multiple filter & sorting options
- Option to include "Dropped" and "On-hold" titles
- User settings (image size, theme, language preferences...)
- Ability to add new titles to your "Planning" list on your selected anime tracker
- User recommendations
*...and more to come!*

<details>
  <summary><h2><a href="#">&#x200B;</a>Screenshots 📷</h2><sub>*click!*</sub></summary>
  <img width="1582" height="1030" alt="SCR-20250817-tdjx" src="https://github.com/user-attachments/assets/119385a3-ea87-4671-acb6-58772a8940ce" />
  <img width="1582" height="1030" alt="SCR-20250817-tdyh" src="https://github.com/user-attachments/assets/7a243ea0-f0b7-453a-add0-26d8fe5b31c8" />
  <img width="1582" height="1030" alt="SCR-20250817-tdwq" src="https://github.com/user-attachments/assets/511b4c38-b105-4e72-b370-62e7141e4c36" />
  <img width="1582" height="1030" alt="SCR-20250817-tebz" src="https://github.com/user-attachments/assets/831dd79a-dbba-4f78-9e6d-97b10fff4909" />
  <img width="1582" height="1030" alt="SCR-20250817-teel" src="https://github.com/user-attachments/assets/d134c71e-c2ce-48e3-824e-a52af6d6db57" />
  <img width="1582" height="1030" alt="SCR-20250817-tfzz" src="https://github.com/user-attachments/assets/149200ba-5a59-4a18-93b7-f0991f509e76" />
</details>

## Developing 🧑‍💻

Built on top of [Next.js](https://nextjs.org), using [Bun](https://bun.sh) runtime.

1. Clone this repo.
```sh
$ git clone https://github.com/Jgrtowy/aniwheel.git
```

2. Go to [AniList developer settings](https://anilist.co/settings/developer) and create a new client.
* Set the Redirect URL to `http://localhost:3000/api/auth/callback/anilist`.
* *Optional:* For production environments, set the Redirect URL to `https://[YOUR_DOMAIN]/api/auth/callback/anilist`.

3. Go to [MyAnimeList developer settings](https://myanimelist.net/apiconfig#_=_) and create an ID
* Set the App Type to `web`.
* Add `http://localhost:3000/api/auth/mal/callback` to the App Redirect URL.
* *Optional:* For production environments, also add `https://[YOUR_DOMAIN]/api/auth/mal/callback`.

4. Copy the `Client ID` and `Client Secret` values from both providers.

5. Generate NextAuth secret with
```sh
$ openssl rand -base64 32
```

6. Copy the `.env.example` file, rename it to `.env` and fill out all fields.

7. Install dependencies
```sh
$ bun install
```

8. Run development server
```sh
$ bun dev
```

And you're ready to go!

## Contributing 🌟

**Contributions are always appreciated in any form!**

*Found an bug? Have an idea for a new feature?*<br />
Create an issue!

*Want to fix or implement something new yourself?*<br />
Fork > make changes > create a PR<br />
We'll review it and if it looks good, merge it!

Need to contact us privately? Write to <a href="mailto:team@aniwheel.moe">team@aniwheel.moe</a>
