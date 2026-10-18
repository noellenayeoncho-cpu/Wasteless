WasteLess

WasteLess is a web application designed to connect people who have items to donate with people who need them. Instead of letting useful items go to waste, users can share donations, post requests, and discover potential matches.

Features

User Accounts: Create an account and log in to WasteLess.

Donate Items: Post descriptions of items available for donation.

Request Items: Share what you need so others can find ways to help.

Matching System: Discover potential matches between donations and requests based on shared keywords.

Donation Images: Add pictures to donation posts using image URLs.

User Profiles: View profile information and profile pictures when available.

Impact Updates: Share updates about how donations have helped.

Why WasteLess?

Many useful items go unused while other people need them. WasteLess aims to make it easier to connect these two groups and encourage reuse, sharing, and community support.

By helping people find new homes for useful items, WasteLess promotes sustainability and reduces unnecessary waste.

Built With

HTML — Structures the pages and content.

CSS — Styles the interface.

JavaScript — Powers interactions and matching functionality.

Firebase Authentication — Manages user sign-up and login.

Cloud Firestore — Stores user profiles, donations, and requests.

Getting Started

Clone or download this repository.

Open the project folder in Visual Studio Code.

Make sure the Firebase project is configured in firebase.js.

Enable Firebase Authentication and Cloud Firestore in the Firebase Console.

Configure Firestore security rules to allow authorized users to read and write the appropriate data.

Run the project using a local development server, such as the Live Server extension in Visual Studio Code.

Create an account and try posting a donation or request.

How Matching Works

WasteLess compares the words in donation descriptions with the words in user requests. When a meaningful word appears in both, the two posts are displayed as a potential match.

Matching is a basic keyword-based system, so a potential match does not guarantee that an item is suitable for a request.

Future Improvements

Real-time messaging between donors and recipients.

More advanced matching based on item categories and descriptions.

Shared impact updates across accounts and devices.

Improved image uploading and storage.

More detailed user profiles and matching options.

Our Mission

WasteLess aims to help the less fortunate find necessities for free and decrease waste
