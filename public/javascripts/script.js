
$(document).ready( function () {
    $('#orderslist').DataTable();
    $('#admin_landingpage').DataTable();
} );


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
$("#checkout-form").submit((e)=>{
    e.preventDefault()
    data=$("#checkout-form").serializeArray()
    total=$("#total-field").html()
    data.push({name: "Total", value:total });
    
    $.ajax({
        url:"/make-purchase",
        method:'post',
        data:data,
       
        
        success:(response)=>{
            if(response.success)
            {
                window.location='/cart'
            }
            else{
                //console.log(response.userName);
                razorpayPayment(response);
            }
           
        }
        

        
    })
})
function razorpayPayment(res){
   
    var options = {
        "key": "rzp_test_qYQ213WoR7N8Rb", // Enter the Key ID generated from the Dashboard
        "amount": res.order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Jithesh",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": res.order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)
            verifyPayment(response,res.order)
        },
        "prefill": {
            "name": res.userName,
            "email": res.userEmail,
            "contact": res.userMobile
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
rzp1.on('payment.failed', function (response){
       // alert(response.error.code);
        //alert(response.error.description);
        //alert(response.error.source);
        //alert(response.error.step);
        //alert(response.error.reason);
       // alert(response.error.metadata.order_id);
       // alert(response.error.metadata.payment_id);
       $('#billing').hide();
       $('#successfull_page').attr("hidden",true);
       $('#errormsg').html(response.error.reason);
       $('#payment_failed').removeAttr('hidden');
        
});
rzp1.open();
}
function verifyPayment(payment,order){
    $.ajax({
        url:'/verify-payment',
        data:{
            payment,
            order
        },
        method:'post',
        success:(response)=>{
            if(response.success){
                //alert(response.msg);
                $('#billing').hide();
                $('#payment_failed').attr("hidden",true);
                $('#successmsg').html(response.msg);
                $('#successfull_page').removeAttr('hidden');

                
            }
            else{
                $('#billing').hide();
                $('#successfull_page').attr("hidden",true);
                $('#errormsg').html(response.errMsg);

                $('#payment_failed').removeAttr('hidden');
                // alert(response.errMsg);
            }

        }
    })

}
function productShip(orderId){

$.ajax({
    url:'/admin/product-shipped?id='+orderId ,
    type:'GET',
    success:(res)=>{
        if(res.success){
            $('#deliveryStatus'+orderId).html('Shipped')
            $('#shipbtn'+orderId).attr("hidden",true)
        }

    }
})

}

function productDelivery(orderId){

    $.ajax({
        url:'/admin/product-delivered?id='+orderId ,
        type:'GET',
        success:(res)=>{
            if(res.success){
                $('#deliveryStatus'+orderId).html('Delivered')
                $('#deliverybtn'+orderId).attr("hidden",true)
            }
    
        }
    })
    
    }