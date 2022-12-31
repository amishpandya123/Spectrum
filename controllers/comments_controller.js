const Comment = require('../models/comment');
const Post = require('../models/post');
const Like = require('../models/like');
const commentsMailer = require('../mailers/comments_mailer');
const User=require('../models/users')

module.exports.create = async function(req, res){

     //console.log("comment");
       
     let post=await Post.findById(req.body.post);
    
         if (post) {
             let comment=  await Comment.create(
             {
               content: req.body.content,
               post: req.body.post,
               user: req.user._id,
             })
               // handle error
    
               console.log(comment);
               post.comments.push(comment);
               post.save();
    
              const user=await Comment.findById(comment._id).populate('user').exec();
            //    console.log(id);
               
            //    const user=User.findById(id);
               console.log(user);
               commentsMailer.newComment(user);
    
            
            if (req.xhr)
            {
                return res.status(200).json
                ({
                    data: 
                    {
                        comment: comment
                    },
                    message: "Comment created"
                });
            }

            req.flash('success', 'Comment Added');
            return res.redirect('back');
        }
    }

module.exports.destroy = async function(req, res)
{
    try
    {
        let comment = await Comment.findById(req.params.id);
        let post = await Post.findById(comment.post);
        if(comment.user == req.user.id ||  post.user == req.user.id)
        {
            let postId = comment.post;

            comment.remove();

            let post = Post.findByIdAndUpdate(postId, { $pull: {comments: req.params.id}});

            await Like.deleteMany({likeable: comment._id, onModel: 'Comment'});

            // send the comment id which was deleted back to the views
            if (req.xhr)
            {
                return res.status(200).json({
                    data: {
                        comment_id: req.params.id
                    },
                    message: "Comment deleted"
                });
            }
                
            req.flash('success', 'Comment Removed');
            return res.redirect('back');
        }
        else
        {
            req.flash('error', 'Unauthorized');
            return res.redirect('back');
        }
    }
    catch(err)
    {
        req.flash('error', err);
        return;
    }
}

