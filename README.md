Create a video on demand subscription node api
 user subscribe to o gain access to watch the videos

the api should REST enpotints have the following functionlity

admin can create a video course  videos are assigned to courses
admin can create/edit/delete courses
a course can have many categories
a category can have one course

admin can create/edit/delete categories
admin can upload videos
can assign the uploaded video to category before uploading
system admin can get analytics of the most watched videos details the most watched videos
system should use MUX for video upload https://www.mux.com/
MUST use token authenticated login, 2fa please use Oauth

Admin can disable a video, if the video is disabled then video is not visable to user
Admin can delete a video, if deleted video is part of a category then video is also removed from the category
Admin can edit a video title
Admin can edit a video description
Admin can change the category a video is assigned to
admin can delete a category, if videos are assigned then existing videos are not deleted, but automatically but assigned unassigned category

use TDD
use postgress database 
for payment should use stripe
need to be high performance use  Martin Kleppmann designing data intensive applications principles for the database
will use render to host the the api at https://render.com create render integration
impletment swagger so i can  test endpoints
create api and create git pr's
should be secure so follow owasp security feature best practice 

admin@mfvod.com
Admin1234!



