

function passes_clear() {
  $('#job_passes').html("")
}

function passes_add(feedrate, intensity, pxsize, items_assigned) {
  // multiple = typeof multiple !== 'undefined' ? multiple : 1  // default to 1
  var num_passes_already = $('#job_passes').children('.pass_widget').length
  var num = num_passes_already + 1
  var html = passes_pass_html(num, feedrate, intensity, pxsize)
  if ($('#pass_add_widget').length) {
    var pass_elem = $(html).insertBefore('#pass_add_widget')
  } else {
    var pass_elem = $(html).appendTo('#job_passes')
  }
  // unblur buttons after pressing
  $("#pass_"+num+" .btn").mouseup(function(){
      $(this).blur();
  })

  // assign colors
  for (var i = 0; i < items_assigned.length; i++) {
    var idx = items_assigned[i]
    $('#passsel_'+num+'_'+idx).hide()
    $('#pass_'+num+'_'+idx).show(300)
    passes_update_handler()
  }

  // assign image thumbs
  jobhandler.loopItems(function(image, idx){
    var img1 = jobhandler.getImageThumb(image, -100, 50)
    $(img1).appendTo('#passsel_'+num+'_'+idx+' a')
    var img2 = jobhandler.getImageThumb(image, -100, 50)
    $(img2).appendTo('#pass_'+num+'_'+idx+' .color_select_btn_'+num)
  }, "image")

  // bind color assign button
  $('#assign_btn_'+num).click(function(e) {
    if (jobview_item_selected !== undefined) {
      var idx = jobview_item_selected
      $('#passsel_'+num+'_'+idx).hide()
      $('#pass_'+num+'_'+idx).hide()
      $('#pass_'+num+'_'+idx).show(300)
      passes_update_handler()
      return false
    } else {
      return true
    }
  })

  // bind all color add buttons within dropdown
  $('.color_add_btn_'+num).click(function(e) {
    var idx = $(this).children('span.idxmem').text()
    $('#passsel_'+num+'_'+idx).hide()
    $('#pass_'+num+'_'+idx).show(300)
    $('#passdp_'+num).dropdown("toggle")
    passes_update_handler()
    return false
  })

  // bind all color remove buttons
  $('.color_remove_btn_'+num).click(function(e) {
    var idx = $(this).parent().find('span.idxmem').text()
    $('#passsel_'+num+'_'+idx).show(0)
    $('#pass_'+num+'_'+idx).hide(300)
    passes_update_handler()
    return false
  })

  // bind all color select buttons
  $('.color_select_btn_'+num).click(function(e) {
    var idx = $(this).parent().find('span.idxmem').text()
    jobhandler.selectItem(idx)
    return false
  })

  // hotkey
  // $('#assign_btn_'+num).tooltip({placement:'bottom', delay: {show:1000, hide:100}})
  Mousetrap.bind([num.toString()], function(e) {
      $('#assign_btn_'+num).trigger('click')
      return false;
  })

  // swap path with the one above
  $('#swap_up_btn_'+num).click(function(e) {
    // num start counting at 1, but we need to swp array elements
    passes_swap(num-1, num)
    return false;
  })

  // swap path with the one below
  $('#swap_dn_btn_'+num).click(function(e) {
    // num start counting at 1, but we need to swp array elements
    passes_swap(num, num+1)
    return false;
  })

  // update duration when feedrate was changed
  $('.feedrate').blur(function(e) {
    passes_update_handler()
    return false
  })

  // check user input for feedrate and update cut-duration when user presses enter in feedrate field
  $('.feedrate').keyup(function(e) {

    if(e.which == 13) {
      passes_update_handler()
    } else {
    feedrate = this.value.match(/[-+]?[0-9]+[\.|,]?[0-9]?/);
	if (!feedrate) {
	  // if no match is found, null is returned for which 0 should be the replacement
	  feedrate = 0
	}
	this.value = feedrate.toString()
  }
  return false
  })

  passes_update_favorites()
}


function passes_swap(pass1, pass2) {
  // get parametes and colors for pass1
  var feedrate1  = Math.round(parseFloat($('#pass_'+pass1).find("input.feedrate").val()))
  var intensity1 = Math.round(parseFloat($('#pass_'+pass1).find("input.intensity").val()))
  var pxsize1    = parseFloat($('#pass_'+pass1).find("input.pxsize").val())
  // get visible colors for pass1
  var idx1 = $('#pass_'+pass1).find('div.pass_colors').children('div').filter(':visible').find('.idxmem').text()
  // remove visible the colors
  $('#pass_'+pass1).find('.color_remove_btn_'+pass1).click()

  // get parametes and colors for pass2
  var feedrate2  = Math.round(parseFloat($('#pass_'+pass2).find("input.feedrate").val()))
  var intensity2 = Math.round(parseFloat($('#pass_'+pass2).find("input.intensity").val()))
  var pxsize2    = parseFloat($('#pass_'+pass2).find("input.pxsize").val())
  // get visible colors for pass1
  var idx2 = $('#pass_'+pass2).find('div.pass_colors').children('div').filter(':visible').find('.idxmem').text()
  // remove visible the colors
  $('#pass_'+pass2).find('.color_remove_btn_'+pass2).click()

  // apply parameters from pass2 to pass 1
  $('#pass_'+pass1).find("input.feedrate").val(feedrate2)
  $('#pass_'+pass1).find("input.intensity").val(intensity2)
  $('#pass_'+pass1).find("input.pxsize").val(pxsize2)
  // apply parameters from pass1 to pass 2
  $('#pass_'+pass2).find("input.feedrate").val(feedrate1)
  $('#pass_'+pass2).find("input.intensity").val(intensity1)
  $('#pass_'+pass2).find("input.pxsize").val(pxsize1)

  // add colors from pass2 to pass1
  for ( var i = 0; i < idx2.length; i++) {
    $('#passsel_'+pass1+'_'+idx2.charAt(i)).hide()
    $('#pass_'+pass1+'_'+idx2.charAt(i)).show(300)
  }
  // add colors from pass1 to pass2
  for ( var i = 0; i < idx1.length; i++) {
    $('#passsel_'+pass2+'_'+idx1.charAt(i)).hide()
    $('#pass_'+pass2+'_'+idx1.charAt(i)).show(300)
  }
}


function passes_pass_html(num, feedrate, intensity, pxsize) {
  // add all color selectors
  var select_html = ''
  var added_html = ''

  jobhandler.loopItems(function(image, idx){
    var color = '#ffffff'
    select_html += passes_select_html(num, idx, "image", color)
    added_html += passes_added_html(num, idx, "image", color)
  }, "image")

  jobhandler.loopItems(function(fill, idx){
    select_html += passes_select_html(num, idx, "fill", fill.color)
    added_html += passes_added_html(num, idx, "fill", fill.color)
  }, "fill")

  jobhandler.loopItems(function(path, idx){
    select_html += passes_select_html(num, idx, "path", path.color)
    added_html += passes_added_html(num, idx, "path", path.color)
  }, "path")

  // html template like it's 1999,
  // updated to use template literals and embedded expressions
  var html = `
  <div id="pass_${num}" class="row pass_widget" style="margin:0; margin-bottom:20px">
    <label style="color:#666666">Pass ${num}</label>
    <a id="pass_conf_btn_${num}" style="margin-left:8px; position:relative; top:1px" role="button"
      data-toggle="collapse" href="#pass_conf_${num}" aria-expanded="false" aria-controls="pass_conf_${num}">
      <span class="glyphicon glyphicon-cog" style="color:#888888"></span>
    </a>
    <a id="swap_dn_btn_${num}" class="btn btn-swap" style="margin-left:8px; position:relative; top:1px" role="button">
      <span class="glyphicon glyphicon-arrow-down" style="color:#888888"></span>
    </a>
    <a id="swap_up_btn_${num}" class="btn btn-swap" style="margin-left:8px; position:relative; top:1px" role="button">
      <span class="glyphicon glyphicon-arrow-up" style="color:#888888"></span>
    </a>
    <div class="dropdown" style="display:inline;">
      <button class="btn btn-default btn-sm dropdown-toggle" type="button" style="width:34px; margin-left:4px;" 
        id="favorites_btn_${num}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" title="favorites [${num}]">
        <span class="glyphicon glyphicon-star-empty"></span>
      </button>
      <ul id="favdp_${num}" data-passnum="${num}" class="dropdown-menu dropdown-menu-right favorites_dropdown" aria-labelledby="forvorites_btn_${num}">
      </ul>
    </div>
    <div class="collapse" id="pass_conf_${num}"><div class="well" style="margin-bottom:10px">
      <div class="input-group" style="margin-right:4px">
        <div class="input-group-addon">pxsize [mm]</div>
          <input type="text" class="form-control input-sm pxsize"
            style="width:44px;" value="${pxsize}" title="size of physical raster pixel in mm">
        </div>
      </div>
    </div>
    <form id="passform_${num}" class="form-inline">
      <div class="form-group">
        <div class="input-group" style="margin-right:4px">
          <div class="input-group-addon" style="width:10px">F</div>
          <input type="text" class="form-control input-sm feedrate" style="width:50px;" value="${feedrate}" title="feedrate">
        </div>
        <div class="input-group" style="margin-right:4px">
          <div class="input-group-addon" style="width:10px">%</div>
          <input type="text" class="form-control input-sm intensity" style="width:44px" value="${intensity}" title="intensity 0-100%">
        </div>
        <div class="dropdown input-group">
          <button class="btn btn-primary btn-sm dropdown-toggle" type="button" style="width:34px" 
            id="assign_btn_${num}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" title="[${num}]">
            <span class="glyphicon glyphicon-plus"></span>
          </button>
          <ul id="passdp_${num}" class="dropdown-menu dropdown-menu-right pass_color_dropdown" aria-labelledby="assign_btn_${num}">
            ${select_html}
          </ul>
        </div>
      </div>
    </form>
    <div class="pass_colors">${added_html}</div>
  </div>
  `
  return html
}


function scale_range(val, in_min, in_max, out_min, out_max) {
  var constrained_val = Math.min(Math.max(val, in_min), in_max)
  return (constrained_val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
}


function favorites_select_html() {
  var html = `
    <li style="border-bottom:1px solid black">
      <a href="#" class="favorites_new_btn">New favorite...</a>
    </li>
  `
  for ( var i = 0; i < favorites.length; i++) {
    html += `
    <li>
      <a href="#" class="favorites_apply_btn">
        <span style="display:inline-block; margin-right:5px;">
          <div style="width:20px; height:0.7ex; border:1px solid gray; margin-bottom:2px;">
            <div style="height:100%; background-color:blue; width:${scale_range(favorites[i].feedrate, 0, 6000, 0, 100)}%"></div>
          </div>
          <div style="width:20px; height:0.7ex; border:1px solid gray;">
            <div style="height:100%; background-color:red; width:${scale_range(favorites[i].intensity, 0, 100, 0, 100)}%"></div>
          </div>
        </span>
        <span>${favorites[i].name}</span>
        <span class="feedmem" style="display:none;">${favorites[i].feedrate}</span>
        <span class="intensitymem" style="display:none;">${favorites[i].intensity}</span>
      </a>
    </li>
    `
  }
  return html
}

function passes_select_html(num, idx, kind, color) {
  var html = `
  <li id="passsel_${num}_${idx}" style="background-color:${color}">
    <a href="#" class="color_add_btn_${num}" style="color:${color}">
      <span class="label label-default kindmem">${kind}, ${color}</span>
      <span class="idxmem" style="display:none">${idx}</span>
    </a>
  </li>
  `
  return html
}

function passes_added_html(num, idx, kind, color) {
  var html = `
  <div id="pass_${num}_${idx}" class="btn-group pull-left" style="margin-top:0.5em; display:none">
    <span style="display:none" class="idxmem">${idx}</span>
    <button class="btn btn-default btn-sm color_select_btn_${num}" 
      type="submit" style="width:175px; background-color:${color}">
      <span class="label label-default kindmem">${kind}, ${color}</span>
    </button>
    <button class="btn btn-default btn-sm color_remove_btn_${num}" type="submit" style="width:34px">
      <span class="glyphicon glyphicon-remove"></span>
    </button>
  </div>
  `
  return html
}



function passes_add_widget() {
  var html = `
  <div id="pass_add_widget" class="row" style="margin:0; margin-bottom:20px">
    <label style="color:#666666">More Passes</label>
    <div>
      <button class="btn btn-default btn-sm dropdown-toggle" type="button" style="width:34px" 
        id="pass_add_btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" title="[P]">
        <span class="glyphicon glyphicon-plus"></span>
      </button>
    </div>
  </div>
  `
  var pass_elem = $(html).appendTo('#job_passes')

  // bind pass_add_btn
  $('#pass_add_btn').click(function(e) {
    passes_add(2000, 20, app_config_main.pxsize, [])
    passes_set_swapBtns()
    return false
  })

  // hotkey
  Mousetrap.bind(['p'], function(e) {
      $('#pass_add_btn').trigger('click')
      return false;
  })
}


function passes_update_favorites() {
  var favorites_html = favorites_select_html()

  $('.favorites_dropdown').html(favorites_html)

  // bind button for new favorite
  $('.favorites_new_btn').click(function(e) {
    var passnum = $(this).parent().parent().data("passnum")
    var feedrate = $('#pass_'+passnum).find("input.feedrate").val()
    var intensity = $('#pass_'+passnum).find("input.intensity").val()
    $('#favorite_feedrate').val(feedrate)
    $('#favorite_intensity').val(intensity)
    $('#favdp_'+passnum).dropdown("toggle")
    $('#favorites_modal').modal('show')
    $('#favorite_name').focus()
    return false
  })

  // bind all favorites buttons within dropdown
  $('.favorites_apply_btn').click(function(e) {
    var passnum = $(this).parent().parent().data("passnum")
    var feedrate = $(this).children('span.feedmem').text()
    var intensity = $(this).children('span.intensitymem').text()
    $('#pass_'+passnum).find("input.feedrate").val(feedrate)
    $('#pass_'+passnum).find("input.intensity").val(intensity)
    $('#favdp_'+passnum).dropdown("toggle")
    $('#passform_'+passnum).hide()
    $('#passform_'+passnum).show(300)
    passes_update_handler()
    return false
  })
}


function passes_get_active() {
  var passes = []
  $('#job_passes').children('.pass_widget').each(function(i) { // each pass
    var feedrate = Math.round(parseFloat($(this).find("input.feedrate").val()))
    var intensity = Math.round(parseFloat($(this).find("input.intensity").val()))
    var pxsize = parseFloat($(this).find("input.pxsize").val())
    var pass = {"items":[]}
    if (typeof(feedrate) === 'number' && !isNaN(feedrate)) { pass.feedrate = feedrate }
    if (typeof(intensity) === 'number' && !isNaN(intensity)) { pass.intensity = intensity }
    if (typeof(pxsize) === 'number' && !isNaN(pxsize)) { pass.pxsize = pxsize }
    $(this).children('div.pass_colors').children('div').filter(':visible').each(function(k) {
      var idx = parseFloat($(this).find('.idxmem').text())
      pass.items.push(idx)
    })
    if (pass.items.length) {
      passes.push(pass)
    }
  })
  return passes
}


function passes_set_assignments() {
  // set passes in gui from current job
  if (jobhandler.hasPasses()) {
    jobhandler.loopPasses(function(pass, items){
      passes_add(pass.feedrate, pass.intensity, pass.pxsize, items)
    })
  } else {
    passes_add(2000, 20, app_config_main.pxsize, [])
    passes_add(2000, 20, app_config_main.pxsize, [])
    passes_add(2000, 20, app_config_main.pxsize, [])
  }
  passes_add_widget()
  passes_set_swapBtns()
}


function passes_update_handler() {
  // called whenever passes widget changes happen (color add/remove)
  // this event handler is debounced to minimize updates

  // TODO: make sure this functions is called, when any of the feedrates was changed, otherwise, passes need to be added
  // and removed to update the duration...

  clearTimeout(window.lastPassesUpdateTimer)
  window.lastPassesUpdateTimer = setTimeout(function() {
    jobhandler.passes = passes_get_active()
    // length


    var length   = (jobhandler.getActivePassesLength()/1000.0).toFixed(1)
    if (length != 0) {
      $('#job_info_length').html(' cut length: '+length+' m')
    } else {
      $('#job_info_length').html('')
    }

    var duration = (jobhandler.getActivePassesDuration() + jobhandler.getSeekPassesLength() * 1/app_config_main.seekrate).toFixed(1)
    if (duration != 0) {
      $('#job_info_duration').html(' | duration: ≥'+duration+' min')
    } else {
      $('#job_info_duration').html('')
    }
    // bounds
    jobhandler.renderBounds()
    jobhandler.draw()
  }, 2000)
}

function passes_set_swapBtns() {
  // this function is called after new passes or new jobs are added/loaded and disables the swap_up_btn for the first and the swap_dn_btn
  // for the last pass

  // enable all arrow btns
  $('#job_passes').find('.btn-swap').css("visibility", "visible")
  // disable swap_up_btn for first pass
  $('#swap_up_btn_1').css("visibility", "hidden")
  // get number of passes and disable swp_btn_dn for last
  n = $('#job_passes').children('.pass_widget').length
  $('#swap_dn_btn_'+n).css("visibility", "hidden")

}
