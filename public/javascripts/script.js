function addCart(proId,price){
    $.ajax({
        url:"/add-to-cart",
        type:'POST',
        data:{
            id:proId


        },
        success:(res)=>{
            if(res.status)
            {
                console.log(res);
                $("#cart-count").html(res.total)
            }
            else{
                //console.log(res);
                window.location="/login"
            }

        }
    })
    

}




function quantityChange(proId,val,price){
    //console.log(proId);
   
$.ajax({
    url:"/quantity-change?id="+proId+"&val="+val ,
    type:'GET',
    success:(res)=>{
        if(res.success)
        {
        console.log("sucess");
        count=$("#quantity-"+proId).html()
        count=parseInt(count)+val
        if(count===1)
        {
            $("#minus-btn-"+proId).prop("disabled", true);
        }
        else{
           
        
            $("#minus-btn-"+proId).prop("disabled", false);
        
        
        }
        $("#quantity-"+proId).html(count)
        total=$("#total-price").html()
        if(val===1){
        
        total=parseInt(total)+price
        }
        else{
            total=parseInt(total)-price
        }
        $("#total-price").html(total)


    }

    }
})
}

function  remove (proId,price){
    //console.log("here")
    if(confirm("Are you sure"))
    {
        quantity = $("#quantity-"+proId).html()
$.ajax({
    
    url:"/remove?id="+proId ,
    type:'GET',
    success:(res)=>{
        if(res.success){
        $("#row-"+proId).remove()
        total=$("#total-price").html()
        
       
        total=parseInt(total)-(parseInt(quantity)*parseInt(price))
        
        $("#total-price").html(total)
        }



    }
})}
}
