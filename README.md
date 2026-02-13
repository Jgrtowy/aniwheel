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

- [x] MyAnimeList and AniList support
- [x] Multiple filter & sorting options
- [x] Option to include "Dropped" and "On-hold" titles
- [x] User settings (image size, theme, language preferences...)
- [x] Ability to add new titles to your "Planning" list on your selected anime tracker
- [x] User recommendations
- [x] Short summary of your list stats
- [ ] Advanced user stats page
- [ ] Manga mode
- [ ] *...and more to come!*

<details>
  <summary><h2><a href="#">&#x200B;</a>Screenshots 📷</h2><sub>*click!*</sub></summary>
  <p align="center">
    <img width="45%" alt="image" src="https://github.com/user-attachments/assets/f3c98e54-e469-4156-9e94-724cd324ee1d" />
    <img width="45%" alt="image" src="https://github.com/user-attachments/assets/5e0c6ff2-a25e-4996-8cf1-064c79a81d13" />
    <br />
    <img width="45%" alt="image" src="https://github.com/user-attachments/assets/c5af3548-dc8f-400b-83af-1955f7e55980" />
    <img width="45%" alt="image" src="https://github.com/user-attachments/assets/a279b925-2ece-4f99-a34b-c89b9a289324" />
    <br />
    <img width="45%" alt="image" src="https://github.com/user-attachments/assets/7cfa5df0-1eef-484c-af6c-4ad7e9d5d15b" />
    <img width="45%" alt="image" src="https://github.com/user-attachments/assets/1f50e263-1eb3-407c-8978-8fab8f355c07" />
    <br />
    <img width="45%" alt="image" src="https://github.com/user-attachments/assets/b0d67cc4-1233-4163-a118-a60c5228f342" />
    <img width="45%" alt="image" src="https://github.com/user-attachments/assets/96b5c9f1-f240-4093-959d-584a1394919c" />
  </p>
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
