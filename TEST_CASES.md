# Test Cases – StudySpot

The tests were run in Chrome with an automated browser script that follows the steps below. Please also try them by hand on your own device and fill in the last column.

| ID | User story | Steps | Expected result | Result | Tested by hand |
|---|---|---|---|---|---|
| TC-01 | US-01 | Enter ID 123 and a valid password, press Sign in | An error asks for at least 6 digits | Pass | |
| TC-02 | US-01 | Enter a valid ID and password 12, press Sign in | An error asks for at least 4 characters | Pass | |
| TC-03 | US-01, US-02 | Enter ID 442012345 and password 1234 | The list shows 8 study spaces | Pass | |
| TC-04 | US-03 | Type room in the search box | 4 rooms are shown | Pass | |
| TC-05 | US-03 | Choose Room, 6+ seats, Floor 2 | 2 results are shown | Pass | |
| TC-06 | US-05, US-12 | Open Study Room B | Building, floor, capacity and facilities are shown | Pass | |
| TC-07 | US-10 | Choose a day on the space page | Free and busy start times are both shown | Pass | |
| TC-08 | US-04, US-11 | Pick a free time and press Book | A confirmation screen with a booking number appears | Pass | |
| TC-09 | US-04 | Open the same space and day again | The booked time is now busy and cannot be selected | Pass | |
| TC-10 | US-06 | Open My bookings | The new booking is under Upcoming | Pass | |
| TC-11 | US-09 | Cancel the booking, then open the space again | The time is free again | Pass | |
| TC-12 | US-08, US-13 | In Past, write a comment and press 5 stars | The rating and comment are saved, the comment shows on the space page, the average updates | Pass | |
| TC-13 | US-13 | Choose Sort: highest rating | Window Table 3 (4.8) is first | Pass | |
| TC-14 | US-14 | Book and cancel, then open Alerts | Notifications for booking confirmed and booking cancelled are listed | Pass | |
| TC-15 | US-07 | Book a time that starts within the reminder time | A reminder notification and banner appear | Pass | |
| TC-16 | US-15 | Save a name and a reminder time in Profile | The name shows in the greeting and the setting is kept | Pass | |
| TC-17 | All | Reload the page | Data is still there | Pass | |
| TC-18 | US-01 | Press Sign out | The login screen appears | Pass | |
| TC-19 | All | Run all the tests above | No JavaScript errors | Pass | |

**Summary:** 19 of 19 test cases passed.
