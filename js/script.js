$(document).ready(function() {
  toastr.options.closeButton = true;
  toastr.options.positionClass = "toast-top-right";

  requerirUsuario();
});

function requerirUsuario() {
  var dialogoUsuario;
  var formulario;
  var usuario = $("#name");
  var campos = $([]).add(usuario);
  var mensajes = $(".validacion");

  $("#name").css({"width": "250px", "height": "40px"});
  $("#name").resizable();

  function actualizarMensaje($mensaje) {
    mensajes.text($mensaje).addClass("ui-state-highlight");
    setTimeout(function() {
      mensajes.removeClass("ui-state-highlight", 1500);
    }, 500);
  }

  function validarLongitud(elemento, $mensaje, min, max) {
    if (elemento.val().length > max || elemento.val().length < min) {
      elemento.addClass("ui-state-error");
      actualizarMensaje("La longitud del " + $mensaje + " debe ser de " + min + " a " + max + " carácteres.");
    } else {
      return true;
    }
  }

  function validarFormato(elemento, regexp, $mensaje) {
    if (!regexp.test(elemento.val())) {
      elemento.addClass("ui-state-error");
      actualizarMensaje($mensaje);
    } else {
      return true;
    }
  }

  function insertarUsuario() {
    var validar = true;
    campos.removeClass("ui-state-error");

    validar = validar && validarLongitud(usuario, "usuario", 3, 100);

    validar = validar && validarFormato(usuario, /^[a-z]([0-9a-z_\s])+$/i, "El nombre de usuario debe consistir de a-z, 0-9, guiones bajos, espacios y debe comenzar con una letra.");
    
    if (validar) {
      $(".usuario").text(usuario.val());
      dialogoUsuario.dialog("close");
      seleccionarDificultad();
    }
    return validar;
  }

  dialogoUsuario = $("#bienvenida").dialog({
    closeOnEscape: false,
    open: function(event, ui) {
        $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
    },
    autoOpen: true,
    height: 320,
    width: 300,
    modal: true,
    show: {
      effect: "bounce",
      duration: 1000
    },
    hide: {
      effect: "fade",
      duration: 1000
    },
    buttons: {
      Empezar: insertarUsuario,
      Cancelar: function() {
        dialogoUsuario.dialog("close");
      }
    },
    close: function() {
      formulario[0].reset();
      campos.removeClass("ui-state-error");
    }
  });

  formulario = dialogoUsuario.find("form").on("submit", function(event) {
    event.preventDefault();
    insertarUsuario();
  });

  $("#cambiar").on("click", function() {
    dialogoUsuario.dialog("open");
  });

}
  function seleccionarDificultad() {
    $("#dificultad p").show();

    dialogoDificultad = $("#dificultad").dialog({
      closeOnEscape: false,
      open: function(event, ui) {
          $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
      },
      autoOpen: true,
      height: 190,
      width: 350,
      show: {
        effect: "bounce",
        duration: 1000
      },
      hide: {
        effect: "blind",
        duration: 500
      },
      buttons: {
        Principiante: function() {iniciarJuego("principiante")},
        Intermedio: function() {iniciarJuego("intermedio")},
        Experto: function() {iniciarJuego("experto")},
      },
      modal: true
    });  
  }

  function mostrarElementos() {
    for (var i = 1; i < 17; i++) {
      $('.material-' + i).show();
    }
  }

// Declaramos las variables de puntuación que usaremos durante el juego
var $puntuacion;
var $puntuacionMaxima = 0;

// Función que inicia el juego recibiendo la dificultad
function iniciarJuego(dificultad) {

  $puntuacion = 0;

  $("#dificultad").dialog("close");

  switch (true) {
    case dificultad == "principiante":
      ocultarMateriales(12);
      $puntuacionMaxima = 4;
      break;
      case dificultad == "intermedio":
      ocultarMateriales(9);
      $puntuacionMaxima = 7;
      break;
      case dificultad == "experto":
      ocultarMateriales(7);
      $puntuacionMaxima = 9;
      break;
    default:
      break;
  }

  // Elementos del juego
  var $materiales = $("#materiales");
  var $elementos = $(".profesion");

  // Activamos la función de arrastrar en los elementos de materiales
  $("li", $materiales).draggable({
    cancel: "a.ui-icon",
    revert: "invalid",
    containment: "document",
    helper: "clone",
    cursor: "move"
  });

  // Permitimos soltar los elementos en los contenedores de profesiones
  $elementos.droppable({
    accept: "#materiales > li, .profesion li",
    classes: {
      "ui-droppable-active": "ui-state-highlight"
    },
    drop: function(event, ui) {
      moverAlContenedor(ui.draggable, $(this));
    }
  });

  // Permitimos devolver los elementos al contenedor de materiales
  $materiales.droppable({
    accept: ".profesion li",
    classes: {
      "ui-droppable-active": "custom-state-active"
    },
    drop: function(event, ui) {
      reciclarImagen(ui.draggable);
    }
  });

  // Función para meter un elemento en el contenedor de profesiones
  function moverAlContenedor($elemento, $contenedor) {
    comprobar($elemento, $contenedor);

    $elemento.fadeOut(function() {
      var $list = $("ul", $contenedor).length
        ? $("ul", $contenedor)
        : $("<ul class='materiales ui-helper-reset'/>").appendTo($contenedor);
      $elemento.find("a.ui-icon-refresh").remove();
      $elemento
        .append(
          "<a href='link/to/recycle/script/when/we/have/js/off' title='Devolver a galería' class='ui-icon ui-icon-refresh'>Devolver imagen</a>"
        )
        .appendTo($list)
        .fadeIn(function() {
          $elemento
            .animate({ width: "50px" })
            .find("img")
            .animate({ height: "40px" });
        });
    });
  }

  // Función que hace las comprobaciones
  function comprobar($elemento, $contenedor) {
    var material = $elemento.find("img").attr("class");
    var profesion = $contenedor.attr("id");

    if (material == profesion) {
      $puntuacion = $puntuacion + 1;
      mostrarMensaje("success", "<p style='margin: 15px 0 0 5px;'>Has conseguido <strong>1 punto</strong>.</p>");
      if ($puntuacion >= $puntuacionMaxima) {
        victoria();
      }
    } else {
      mostrarMensaje("error", "<p style='margin: 15px 0 0 5px;'>Creo que te has equivocado.</p>");
    }
  }

  function victoria() {
    $("#victoria p").show();
    $("#puntuacion").text($puntuacion)

    dialogoVictoria = $("#victoria").dialog({
      closeOnEscape: false,
      open: function(event, ui) {
          $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
      },
      autoOpen: true,
      height: 250,
      width: 350,
      show: {
        effect: "bounce",
        duration: 1000
      },
      hide: {
        effect: "explode",
        duration: 1000
      },
      buttons: {
        Si: function() {
          for (var i = 1; i < 17; i++){
            reciclarImagen($(".material-" + i))
          }
          seleccionarDificultad();
          dialogoVictoria.dialog("close");
        },
        No: function() {dialogoVictoria.dialog("close");}
      },
      modal: true
    });  
  }

  // Función para mostrar un $mensaje con Toastr
  function mostrarMensaje($tipo, $mensaje) {
    switch (true) {
      case $tipo == "success":
        toastr.success($mensaje, "¡BIEN!");
        break;
      case $tipo == "error":
        toastr.error($mensaje, "¡MAL!");
        break;
      case $tipo == "warning":
        toastr.warning($mensaje, "ATENCIÓN");
        break;
      default:
        toastr.info($mensaje, "Información");
        break;
    }
  }

  // Función para devolver un elemento al contenedor de materiales (Reciclar)
  function reciclarImagen($elemento) {
    $elemento.fadeOut(function() {
      $elemento
        .find("a.ui-icon-refresh")
        .remove()
        .end()
        .css("width", "100px")
        .find("img")
        .css("height", "75px")
        .end()
        .appendTo($materiales)
        .fadeIn();
    });
  }

  // Función para agrandar la imagen en una ventana modal de diálogo
  function agrandarImagen($ruta) {
    var src = $ruta.attr("href"),
      titulo = $ruta.siblings("img").attr("alt"),
      $modal = $("img[src$='" + src + "']");

    var img = $("<img id='imagenAumentada' alt='" + titulo + "' />")
      .attr("src", src)
      .appendTo("body");
    setTimeout(function() {
      img.dialog({ title: titulo, width: 500, modal: true });
    }, 1);
  }

  // Adjudicamos las funcionalidades de los iconos de los elementos
  $("ul.gallery > li").on("click", function(event) {
    var $elemento = $(this);
    var $evento = $(event.target);

    if ($evento.is("a.ui-icon-zoomin")) {
      agrandarImagen($evento);
    } else if ($evento.is("a.ui-icon-refresh")) {
      reciclarImagen($elemento);
    }
    return false;
  });

  // Adjudicamos las funcionalidades de los iconos de los elementos
  $("ul.materiales > li").on("click", function(event) {
    var $elemento = $(this);
    var $evento = $(event.target);

    if ($evento.is("a.ui-icon-zoomin")) {
      agrandarImagen($evento);
    } else if ($evento.is("a.ui-icon-refresh")) {
      reciclarImagen($elemento);
    }
    return false;
  });

  
}
    function ocultarMateriales(elementos) {
      var $aleatorio;
      var $elementoSeleccionado;
      var $total = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    
      for (var i = 0; i < elementos; i++) {
        $aleatorio = Math.floor(Math.random() * ($total.length));
        $elementoSeleccionado = $total[$aleatorio];
        $total.splice($aleatorio, 1);

        $('.material-' + $elementoSeleccionado).hide();
      }
    }
