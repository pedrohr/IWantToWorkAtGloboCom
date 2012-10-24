var selected = 0;

$("#"+selected+" .participantAvatar").addClass("selected");

$(".participant .participantAvatar").click(function() {
    selected = $(this).attr("id")[1];

    $(".participant "+" .participantAvatar").each(function(i) {
	$(this).removeClass("selected");
    });

    $(this).addClass("selected");    
});

$("#formButton").click(function() {
    $.ajax({
	url: '/vote/'+selected,
	type: 'POST',
	success: function(data) {
	    $("#innerWrapper").html(data);
	},
	error: function(data) {
	    alert("Ops! Nossos servidores voltarão a qualquer momento. Tente novamente mais tarde.");
	}
    });
});
