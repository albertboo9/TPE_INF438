import React, { useState } from "react";
import { useForm } from "react-hook-form";
import AuthBackground from "../../components/background/AuthBackground";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { User, LockKeyhole } from "lucide-react";

type LoginFormData = {
  username:string
  password:string
}

export default function Login(){

const {
register,
handleSubmit,
formState:{errors}

}=useForm<LoginFormData>()

const onSubmit=(data:LoginFormData)=>{

console.log(data)

}

return(

<div
className="
relative
min-h-screen
flex
items-center
justify-center
overflow-hidden

bg-gradient-to-br
from-primary
via-[#7050B5]
to-secondary

p-5
"
>

{/* GLOBAL BACKGROUND */}

<AuthBackground/>

{/* MAIN CARD */}

<div
className="
relative
z-10
w-full
max-w-[1200px]
bg-white/10
backdrop-blur-lg
rounded-[20px]
overflow-hidden
shadow-[0_20px_80px_rgba(0,0,0,0.25)]
grid
lg:grid-cols-2
"
>

{/* LEFT IMAGE SECTION */}

<div
className="
relative
min-h-[600px]
"
>

<img
src="/login_image.png"
alt="dashboard"
className="
absolute
inset-0
w-full
h-full
object-cover
"
/>

<div
className="
absolute
inset-0
bg-black/30
"
/>

<div
className="
relative
z-10
h-full
flex
flex-col
justify-start
text-white
p-8
lg:p-14
"
>

<h1
className="
text-5xl
lg:text-6xl
font-bold
leading-tight
"
>
Welcome
<br/>
Back!
</h1>

<p
className="
mt-6
opacity-90
max-w-lg
leading-7
"
>
Connectez-vous à votre plateforme
d’analyse et de prévision des ventes
pour aider à la prise de décision
et optimiser les performances
de votre supermarché.
</p>

<div
className="
flex
gap-4
mt-12
"
>

<Button variant="light">
Learn More
</Button>

<Button variant="secondary">
Watch Demo
</Button>

</div>

</div>

</div>

{/* RIGHT FORM */}

<div
className="
bg-white
p-8
lg:p-14
flex
items-center
justify-center
"
>

<div
className="
w-full
max-w-md
"
>

<h2
className="
text-4xl
font-bold
text-text
"
>
Welcome to Company
</h2>

<p
className="
text-neutral
mt-2
"
>
Sign in to continue
</p>

<form
onSubmit={handleSubmit(onSubmit)}
>

<div
className="
mt-12
space-y-6
"
>

{/* USERNAME */}

<div>

<div
className={`
flex
items-center
gap-4
bg-[#F4EEFF]
rounded-2xl
px-5
py-4

${errors.username
?"border border-red-400"
:""
}
`}
>

<User
className={
errors.username
?
"text-red-500"
:
"text-neutral"
}
/>

<input
type="text"
placeholder="Username"

className="
bg-transparent
outline-none
w-full
"

{...register(
"username",
{
required:"Username required",

minLength:{
value:3,
message:"Minimum 3 characters"
}
}
)}
/>

</div>

{
errors.username&&(

<p
className="
text-red-500
text-sm
mt-2
ml-2
"
>

{errors.username.message}

</p>

)
}

</div>

{/* PASSWORD */}

<div>

<div
className={`
flex
items-center
gap-4
bg-[#F4EEFF]
rounded-2xl
px-5
py-4

${errors.password
?
"border border-red-400"
:
""
}
`}
>

<LockKeyhole
className={
errors.password
?
"text-red-500"
:
"text-neutral"
}
/>

<input
type="password"
placeholder="Password"

className="
bg-transparent
outline-none
w-full
"

{...register(
"password",
{
required:"Password required",

minLength:{
value:6,
message:"Minimum 6 characters"
}
}
)}
/>

</div>

{
errors.password&&(

<p
className="
text-red-500
text-sm
mt-2
ml-2
"
>

{errors.password.message}

</p>

)
}

</div>

</div>

<div
className="
mt-5
flex
items-center
gap-3
"
>

<input type="checkbox"/>

<span className="text-neutral">

Remember me

</span>

</div>

<div className="mt-10">

<Button
type="submit"
fullWidth
>

Login

</Button>

</div>

</form>

</div>

</div>

</div>

</div>

)

}
